import express from "express";
import bodyParser from "body-parser";
import { writeFileSync } from "fs";
import path from "path";
import fetch from "node-fetch";
import { exec } from "child_process";

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

// 生成视频的路由
app.post("/generate", async (req, res) => {
  const text = req.body.text || "你好，这是一个自动生成的视频示例。";

  try {
    const outputFile = path.join("/tmp", "output.mp4");

    // 用 openai 的免费接口生成语音（无需 API 密钥）
    const ttsUrl = `https://api.voicerss.org/?key=demo&hl=zh-cn&src=${encodeURIComponent(text)}`;
    const ttsRes = await fetch(ttsUrl);
    const audioPath = path.join("/tmp", "voice.mp3");
    const audioBuffer = await ttsRes.arrayBuffer();
    writeFileSync(audioPath, Buffer.from(audioBuffer));

    // 使用 ffmpeg 生成视频（背景 + 字幕 + 音频）
    const ffmpegCmd = `
      ffmpeg -loop 1 -i https://picsum.photos/720/1280 \
      -i ${audioPath} -vf "drawtext=text='${text}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=h-100" \
      -t 10 -pix_fmt yuv420p ${outputFile} -y
    `;

    exec(ffmpegCmd, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.sendFile(outputFile);
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
