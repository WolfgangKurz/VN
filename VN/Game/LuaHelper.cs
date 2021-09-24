using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Reflection;

namespace VN.Game {
	internal static class LuaHelper {
		private static Dictionary<(object, string), KeraLua.LuaFunction> HelperCache { get; } = new Dictionary<(object, string), KeraLua.LuaFunction>();

		public static void Register<T>(NLua.Lua lua, string targetName, T value) => LuaHelper.Register(lua, targetName, (object)value);
		public static void Register(NLua.Lua lua, string targetName, object value) {
			var t = value.GetType();
			var state = lua.State;

			if (value is Delegate) {
				var method = (value as Delegate).Method;

				var parameters = method.GetParameters();

				var key = (null as object, targetName);
				KeraLua.LuaFunction func = (pState) => {
					var state = KeraLua.Lua.FromIntPtr(pState);

					var argc = state.GetTop();
					var reqArgc = parameters.Count(x => !x.IsOptional);
					var paramArray = parameters.Any(x => x.GetCustomAttributes(typeof(ParamArrayAttribute), false).Length > 0);

					if (argc < reqArgc)
						return state.Error($"{targetName} requires {reqArgc} arguments at least, but {argc} passed");
					else if (!paramArray && argc > parameters.Length)
						return state.Error($"{targetName} requires {reqArgc} arguments at most, but {argc} passed");

					var paramList = new List<object>();

					for (var pidx = 0; pidx < parameters.Length; pidx++) {
						var param = parameters[pidx];
						if (param.GetCustomAttributes(typeof(ParamArrayAttribute), false).Length > 0) {
							// params T[]
							var type = param.ParameterType;
							var at = type.GetElementType();
							for (var i = pidx + 1; i <= argc; i++) {
								LuaHelper.ConvertParameter(
									state,
									targetName,
									i,
									at,
									false,
									null,
									(v) => paramList.Add(v)
								);
							}
							paramArray = true;
							break;
						}
						LuaHelper.ConvertParameter(
							state,
							targetName,
							pidx + 1,
							param.ParameterType,
							param.IsOptional,
							param.DefaultValue,
							(v) => paramList.Add(v)
						);
					}

					var ret = (value as Delegate).DynamicInvoke(paramList.ToArray());
					return LuaHelper.ReturnHelper(state, ret, method.ReturnType);
				};

				if (!HelperCache.ContainsKey(key))
					HelperCache.Add(key, func);
				else
					HelperCache[key] = func;

				state.PushCFunction(HelperCache[key]);
				state.SetGlobal(targetName);
				return;
			}

			if (LuaHelper.ReturnHelper(state, value, t, true) == -1) {
				LuaHelper.RegisterClass(lua, targetName, value);
				return;
			}
			state.SetGlobal(targetName);
		}
		private static void RegisterClass(NLua.Lua lua, string className, object instance) {
			var t = instance.GetType();
			var methods = t.GetMethods(BindingFlags.Public | BindingFlags.Instance);

			var state = lua.State;
			state.NewTable();

			foreach (var method in methods) {
				var name = method.Name;
				var parameters = method.GetParameters();

				var key = (instance, $"{className}:{name}");
				KeraLua.LuaFunction func = (pState) => {
					var state = KeraLua.Lua.FromIntPtr(pState);

					var argc = state.GetTop();
					var reqArgc = parameters.Count(x => !x.IsOptional);
					var paramArray = parameters.Any(x => x.GetCustomAttributes(typeof(ParamArrayAttribute), false).Length > 0);

					if (argc < reqArgc)
						return state.Error($"{className}.{name} requires {reqArgc} arguments at least, but {argc} passed");
					else if (!paramArray && argc > parameters.Length)
						return state.Error($"{className}.{name} requires {reqArgc} arguments at most, but {argc} passed");

					var paramList = new List<object>();

					for (var pidx = 0; pidx < parameters.Length; pidx++) {
						var param = parameters[pidx];
						if (param.GetCustomAttributes(typeof(ParamArrayAttribute), false).Length > 0) {
							// params T[]
							var type = param.ParameterType;
							var at = type.GetElementType();
							for (var i = pidx + 1; i <= argc; i++) {
								LuaHelper.ConvertParameter(
									state,
									$"{className}.{name}",
									i,
									at,
									false,
									null,
									(v) => paramList.Add(v)
								);
							}
							paramArray = true;
							break;
						}
						LuaHelper.ConvertParameter(
							state,
							$"{className}.{name}",
							pidx + 1,
							param.ParameterType,
							param.IsOptional,
							param.DefaultValue,
							(v) => paramList.Add(v)
						);
					}

					var ret = method.Invoke(instance, paramArray ? new object[] { paramList.ToArray() } : paramList.ToArray());
					return LuaHelper.ReturnHelper(state, ret, method.ReturnType);
				};

				if (!HelperCache.ContainsKey(key))
					HelperCache.Add(key, func);
				else
					HelperCache[key] = func;

				// state.PushCopy(-1);
				state.PushString(name);
				state.PushCFunction(HelperCache[key]);
				state.SetTable(-3);
			}
			state.SetGlobal(className);
		}

		private static bool ConvertParameter(KeraLua.Lua state, string callee, int index, Type type, bool optional, object defVal, Action<object> cb) {
			if (type == typeof(object)) {
				var ltype = state.Type(index);
				switch (ltype) {
					case KeraLua.LuaType.None:
						if (optional) {
							cb(defVal);
							return true;
						}

						state.Error($"{callee} {index}th argument is required");
						return false;

					case KeraLua.LuaType.Nil:
						if (optional) {
							cb(defVal);
							return true;
						}
						cb(null);
						return true;

					case KeraLua.LuaType.Boolean:
						cb(state.ToBoolean(index));
						return true;

					case KeraLua.LuaType.LightUserData:
						state.Error($"LightUserData argument is not implemented");
						return false;

					case KeraLua.LuaType.Number:
						cb(state.CheckNumber(index));
						return true;

					case KeraLua.LuaType.String:
						cb(state.CheckString(index));
						return true;

					case KeraLua.LuaType.Table: {
							var dict = new Dictionary<object, object>();

							state.PushCopy(index); // table
							state.PushNil(); // key
							while (state.Next(-2)) { // push value, not key
								object key = null, value = null;
								LuaHelper.ConvertParameter(state, callee, -2, typeof(object), false, null, (v) => key = v);
								LuaHelper.ConvertParameter(state, callee, -1, typeof(object), false, null, (v) => value = v);
								dict.Add(key, value);

								state.Pop(1); // value
							}
							state.Pop(1); // table

							cb(dict);
							return true;
						}

					case KeraLua.LuaType.Function:
						state.Error($"Function argument is not implemented");
						return false;

					case KeraLua.LuaType.UserData:
						state.Error($"UserData argument is not implemented");
						return false;

					case KeraLua.LuaType.Thread:
						state.Error($"Thread argument is not implemented");
						return false;
				}
			}

			if (
				type == typeof(byte) || type == typeof(short) || type == typeof(int) || type == typeof(long) ||
				type == typeof(sbyte) || type == typeof(ushort) || type == typeof(uint) || type == typeof(ulong)
			) {
				if (optional)
					cb(Convert.ChangeType(state.OptInteger(index, (long)Convert.ChangeType(defVal, typeof(long))), type));
				else
					cb(Convert.ChangeType(state.CheckInteger(index), type));
				return true;
			}

			if (type == typeof(float) || type == typeof(double)) {
				if (optional)
					cb(Convert.ChangeType(state.OptNumber(index, (double)Convert.ChangeType(defVal, typeof(double))), type));
				else
					cb(Convert.ChangeType(state.CheckNumber(index), type));
				return true;
			}

			if (type == typeof(string)) {
				if (optional)
					cb(Convert.ChangeType(state.OptString(index, (string)defVal), type));
				else
					cb(Convert.ChangeType(state.CheckString(index), type));

				return true;
			}

			if (type == typeof(bool)) {
				var t = state.Type(index);
				if (t == KeraLua.LuaType.None) {
					if (!optional) {
						state.Error($"{callee} {index}th argument is required");
						return false;
					}
					cb((bool)defVal);
					return true;
				}
				cb(state.ToBoolean(index));
				return true;
			}

			if (type.IsSubclassOf(typeof(Array))) {
				var _type = state.Type(index);
				if (_type == KeraLua.LuaType.None) {
					if (optional) {
						cb(defVal);
						return true;
					}
					state.Error($"{callee} {index}th argument is required");
					return false;
				}

				state.CheckType(index, KeraLua.LuaType.Table);

				var eT = type.GetElementType();
				var defTypeValue = eT.IsValueType
					? Activator.CreateInstance(eT)
					: null;

				var size = state.Length(index);
				var count = 0;
				var arr = Array.CreateInstance(eT, size);

				state.PushCopy(index); // table
				state.PushNil(); // key
				while (state.Next(index)) { // push value, not key
					long key = 0;
					object value = null;
					LuaHelper.ConvertParameter(state, callee, -2, typeof(long), false, null, (v) => key = (long)v);
					LuaHelper.ConvertParameter(state, callee, -1, typeof(object), false, null, (v) => value = v);

					arr.SetValue(Convert.ChangeType(value, eT), key - 1);
					count++;
					state.Pop(1); // value

					if (count >= size) {
						while (state.Next(index)) ;
						break;
					}
				}
				state.Pop(1); // table

				cb(arr);
				return true;
			}

			state.Error($"Cannot convert argument type to {type.Name}");
			return false;
		}

		private static int ReturnHelper(KeraLua.Lua state, object ret, Type type, bool p = false) {
			if (type == typeof(void))
				return 0;

			if (
				type == typeof(byte) || type == typeof(short) || type == typeof(int) || type == typeof(long) ||
				type == typeof(sbyte) || type == typeof(ushort) || type == typeof(uint) || type == typeof(ulong)
			) {
				state.PushInteger((long)Convert.ChangeType(ret, typeof(long)));
				return 1;
			}

			if (type == typeof(float) || type == typeof(double)) {
				state.PushNumber((double)Convert.ChangeType(ret, typeof(double)));
				return 1;
			}

			if (type == typeof(string)) {
				state.PushString((string)ret);
				return 1;
			}

			if (type == typeof(bool)) {
				state.PushBoolean((bool)ret);
				return 1;
			}

			if (type.IsSubclassOf(typeof(Array))) {
				var r = ret as Array;
				state.NewTable();

				var idx = 0;
				foreach (var e in r) {
					// state.PushCopy(-1);
					state.PushInteger(++idx);
					LuaHelper.ReturnHelper(state, e, e.GetType());
					state.SetTable(-3);
				}
				return 1;
			}

			if (type.IsGenericType) {
				var tuples = new Type[] {
					typeof(ValueTuple<>),
					typeof(ValueTuple<,>),
					typeof(ValueTuple<,,>),
					typeof(ValueTuple<,,,>),
					typeof(ValueTuple<,,,,>),
					typeof(ValueTuple<,,,,,>),
					typeof(ValueTuple<,,,,,,>),
					typeof(ValueTuple<,,,,,,,>)
				};
				var dt = type.GetGenericTypeDefinition();
				if (tuples.Any(x => x == dt)) {
					var items = type.GenericTypeArguments.Length;
					var rets = 0;
					for (var i = 1; i <= items; i++) {
						var e = i < 8
							? type.GetField($"Item{i}").GetValue(ret)
							: type.GetField("Rest").GetValue(ret);

						rets += LuaHelper.ReturnHelper(state, e, e.GetType());
					}
					return rets;
				}
			}

			if (p)
				return -1;
			else
				return state.Error("Invalid type " + type.Name);
		}
	}
}
