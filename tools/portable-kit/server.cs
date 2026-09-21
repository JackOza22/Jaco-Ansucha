using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

internal static class Program
{
    private static string root;
    private static readonly Dictionary<string, string> Mimes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { ".html", "text/html; charset=utf-8" },
        { ".htm", "text/html; charset=utf-8" },
        { ".css", "text/css; charset=utf-8" },
        { ".js", "text/javascript; charset=utf-8" },
        { ".mjs", "text/javascript; charset=utf-8" },
        { ".json", "application/json" },
        { ".svg", "image/svg+xml" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif", "image/gif" },
        { ".webp", "image/webp" },
        { ".woff", "font/woff" },
        { ".woff2", "font/woff2" },
        { ".ttf", "font/ttf" },
        { ".pdf", "application/pdf" },
        { ".mp4", "video/mp4" },
        { ".txt", "text/plain; charset=utf-8" },
        { ".ico", "image/x-icon" }
    };

    private static int Main()
    {
        try
        {
            root = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(root);

            TcpListener listener = null;
            int port = 0;
            int[] ports = { 8000, 8765, 5500, 9000, 18000 };
            foreach (int p in ports)
            {
                try
                {
                    listener = new TcpListener(IPAddress.Loopback, p);
                    listener.Start();
                    port = p;
                    break;
                }
                catch
                {
                    listener = null;
                }
            }

            if (listener == null)
            {
                Console.WriteLine("Could not start a local server. Close other copies of this site and try again.");
                Console.WriteLine("Press Enter to close.");
                Console.ReadLine();
                return 1;
            }

            string url = "http://127.0.0.1:" + port + "/";
            Console.Title = "Jaco & Anuscha portfolio";
            Console.WriteLine();
            Console.WriteLine("  Jaco & Anuscha portfolio is running.");
            Console.WriteLine("  " + url);
            Console.WriteLine("  Keep this window open while you show the site.");
            Console.WriteLine("  Close this window to stop.");
            Console.WriteLine();

            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch
            {
                Console.WriteLine("Open this address in your browser: " + url);
            }

            while (true)
            {
                TcpClient client = listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(Serve, client);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.Message);
            Console.WriteLine("Press Enter to close.");
            Console.ReadLine();
            return 1;
        }
    }

    private static void Serve(object state)
    {
        TcpClient client = (TcpClient)state;
        try
        {
            client.NoDelay = true;
            NetworkStream stream = client.GetStream();
            stream.ReadTimeout = 8000;
            stream.WriteTimeout = 8000;

            string request = ReadRequest(stream);
            if (string.IsNullOrEmpty(request)) return;

            string[] first = request.Split(new[] { ' ' }, 3);
            if (first.Length < 2) { WriteStatus(stream, 400, "Bad Request"); return; }

            string pathUrl = first[1];
            int q = pathUrl.IndexOf('?');
            if (q >= 0) pathUrl = pathUrl.Substring(0, q);
            pathUrl = Uri.UnescapeDataString(pathUrl);
            if (pathUrl == "/") pathUrl = "/index.html";
            pathUrl = pathUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            if (pathUrl.Contains("..")) { WriteStatus(stream, 403, "Forbidden"); return; }

            string full = Path.GetFullPath(Path.Combine(root, pathUrl));
            string rootFull = Path.GetFullPath(root);
            if (!full.StartsWith(rootFull, StringComparison.OrdinalIgnoreCase))
            {
                WriteStatus(stream, 403, "Forbidden");
                return;
            }
            if (Directory.Exists(full)) full = Path.Combine(full, "index.html");
            if (!File.Exists(full)) { WriteStatus(stream, 404, "Not found"); return; }

            byte[] body = File.ReadAllBytes(full);
            string ext = Path.GetExtension(full);
            string mime = Mimes.ContainsKey(ext) ? Mimes[ext] : "application/octet-stream";
            string header =
                "HTTP/1.1 200 OK\r\n" +
                "Content-Type: " + mime + "\r\n" +
                "Content-Length: " + body.Length + "\r\n" +
                "Connection: close\r\n" +
                "Cache-Control: no-cache\r\n\r\n";
            byte[] head = Encoding.ASCII.GetBytes(header);
            stream.Write(head, 0, head.Length);
            stream.Write(body, 0, body.Length);
        }
        catch { }
        finally
        {
            try { client.Close(); } catch { }
        }
    }

    private static string ReadRequest(NetworkStream stream)
    {
        MemoryStream buf = new MemoryStream();
        byte[] tmp = new byte[1024];
        while (buf.Length < 32768)
        {
            int n = stream.Read(tmp, 0, tmp.Length);
            if (n <= 0) break;
            buf.Write(tmp, 0, n);
            byte[] soFar = buf.ToArray();
            string text = Encoding.ASCII.GetString(soFar);
            if (text.Contains("\r\n\r\n")) return text;
        }
        return buf.Length == 0 ? null : Encoding.ASCII.GetString(buf.ToArray());
    }

    private static void WriteStatus(NetworkStream stream, int code, string msg)
    {
        byte[] body = Encoding.UTF8.GetBytes(msg);
        string header =
            "HTTP/1.1 " + code + " " + msg + "\r\n" +
            "Content-Type: text/plain; charset=utf-8\r\n" +
            "Content-Length: " + body.Length + "\r\n" +
            "Connection: close\r\n\r\n";
        byte[] head = Encoding.ASCII.GetBytes(header);
        stream.Write(head, 0, head.Length);
        stream.Write(body, 0, body.Length);
    }
}
