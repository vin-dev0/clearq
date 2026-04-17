import { generateText } from "ai";
import { getAIModel } from "./src/lib/ai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
  const aiModel = getAIModel({
    provider: "groq",
    model: "llama3-8b-8192"
  });

  try {
    const result = await generateText({
      model: aiModel,
      prompt: 'Say hello world',
    });
    console.log(result.text);
  } catch (err) {
    console.error(err);
  }
}
main();
