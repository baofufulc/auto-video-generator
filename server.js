import express from "express";
import fs from "fs";
import fetch from "node-fetch";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";
import path from "path";
import gtts from "gtts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const execAsync = promisify(exec);
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const text = req.body.text || "你好，这是一个测试视频。";
    const bgUrl = "https://picsum.photos/720/1280"; // 随机背景
    const bgFile = path.join(__dirname, "bg.jpg");
    const voiceFile = path.join(__dirname, "voice.mp3");
    const outputFile = path.join(__dirname, `video_${Date.now()}.mp4`);

    // 下载背景图
    const response = await fetch(bgUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(bgFile, Buffer.from(buffer));

    // 生成中文语音
    const speech = new gtts(text, "zh");
    await new Promise((resolve, reject) => {
      speech.save(voiceFile, err => (err ? reject(err) : resolve()));
    });

    // 生成视频命令（竖屏+字幕）
    const ffmpegCmd = `
      ffmpeg -loop 1 -i ${bgFile} -i ${voiceFile} \
      -vf "subtitles='sub.srt':force_style='FontName=SimHei,FontSize=24,PrimaryColour=&HFFFFFF&'" \
      -t 20 -c:v libx264 -c:a aac -strict experimental -shortest ${outputFile}
    `;

    await execAsync(ffmpegCmd);

    res.json({
      message: "✅ 视频生成成功！",
      video_url: `https://${process.env.RAILWAY_STATIC_URL || req.headers.host}/${path.basename(outputFile)}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🎬 视频生成服务已启动 on port 3000"));
