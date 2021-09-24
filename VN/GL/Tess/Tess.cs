using SharpGL;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace SharpGL {
	internal static class Tess {
		private const string LIBRARY_GLU = "Glu32.dll";

		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.Begin callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.BeginData callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.Combine callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.CombineData callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.EdgeFlag callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.EdgeFlagData callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.End callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.EndData callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.Error callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.ErrorData callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.Vertex callback);
		[DllImport(LIBRARY_GLU, SetLastError = true)] private static extern void gluTessCallback(IntPtr tess, int which, VN.GL.Tess.Delegates.VertexData callback);

		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.Begin callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_BEGIN, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.BeginData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_BEGIN_DATA, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.Combine callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_COMBINE, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.CombineData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_COMBINE_DATA, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.EdgeFlag callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_EDGE_FLAG, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.EdgeFlagData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_EDGE_FLAG_DATA, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.End callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_END, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.EndData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_END_DATA, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.Error callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_ERROR, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.ErrorData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_ERROR_DATA, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.Vertex callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_VERTEX, callback);
		public static void TessCallback(this OpenGL gl, IntPtr tess, VN.GL.Tess.Delegates.VertexData callback) => gluTessCallback(tess, (int)OpenGL.GLU_TESS_VERTEX_DATA, callback);
	}
}
