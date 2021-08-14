using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using NAudio;
using NAudio.Wave;

namespace VN.VNScript {
	internal sealed class VNAudio : IDisposable {
		private class LoopStream : WaveStream {
			WaveStream sourceStream;

			public LoopStream(WaveStream sourceStream) {
				this.sourceStream = sourceStream;
				this.EnableLooping = true;
			}

			public bool EnableLooping { get; set; }

			public override WaveFormat WaveFormat => sourceStream.WaveFormat;

			public override long Length => sourceStream.Length;

			public override long Position {
				get { return sourceStream.Position; }
				set { sourceStream.Position = value; }
			}

			public override int Read(byte[] buffer, int offset, int count) {
				int totalBytesRead = 0;

				while (totalBytesRead < count) {
					var bytesRead = sourceStream.Read(buffer, offset + totalBytesRead, count - totalBytesRead);
					if (bytesRead == 0) {
						if (sourceStream.Position == 0 || !EnableLooping) break;
						sourceStream.Position = 0;
					}
					totalBytesRead += bytesRead;
				}
				return totalBytesRead;
			}
		}

		public bool Disposed { get; private set; }

		public string Path { get; private set; }

		private AudioFileReader reader { get; set; }
		private WaveOutEvent waveOut { get; set; }
		private Thread thread { get; set; }

		public VNAudio() { }

		public void Dispose() {
			if (this.Disposed) return;
			this.Unload();
			this.Disposed = true;
		}

		public void Load(string path, bool repeat = false) {
			if (this.Disposed) return;
			this.Unload();

			try {
				this.Path = path;
				this.reader = new AudioFileReader(path);

				this.waveOut = new WaveOutEvent();
				this.waveOut.Init(repeat
					? new LoopStream(reader)
					: (WaveStream)reader
				);
			}
			catch(Exception e) {
				this.Path = null;
				throw e;
			}
		}

		public void Unload() {
			if (this.Disposed) return;
			this.Path = null;

			if(this.thread != null) {
				this.thread.Abort();
				this.thread = null;
			}

			if (this.reader != null) {
				this.reader.Close();
				this.reader.Dispose();
				this.reader = null;
			}

			if (this.waveOut != null) {
				this.waveOut.Stop();
				this.waveOut.Dispose();
				this.waveOut = null;
			}
		}

		public void Play() {
			if (this.Disposed) return;
			if (this.waveOut == null) return;

			if (this.thread == null) {
				this.thread = new Thread(() => {
					while (this.waveOut.PlaybackState == PlaybackState.Playing)
						Thread.Sleep(500);

					this.thread = null;
				});
			}

			this.waveOut.Play();
			if (!this.thread.IsAlive)
				this.thread.Start();
		}

		public void Pause() {
			if (this.Disposed) return;
			if (this.waveOut == null) return;

			this.waveOut.Pause();
		}

		public void Stop() {
			if (this.Disposed) return;
			if (this.waveOut == null) return;

			this.waveOut.Stop();
		}

		public double CurrentTime => this.Disposed || this.reader == null
			? double.NaN
			: this.reader.CurrentTime.TotalSeconds;

		public void Seek(double time) {
			if (this.Disposed) return;
			if (this.waveOut == null) return;

			this.reader.CurrentTime = TimeSpan.FromSeconds(time);
		}

		public float Volume {
			get {
				if (this.Disposed) return -1;
				if (this.waveOut == null) return -1;

				return this.waveOut.Volume;
			}
			set {
				if (this.Disposed) return;
				if (this.waveOut == null) return;

				this.waveOut.Volume = Math.Min(Math.Max(value, 0), 1);
			}
		}
	}
}
