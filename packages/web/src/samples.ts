/**
 * 各语言的接入示例（域名与假 API Key 直接内嵌，无需占位符替换）。
 * 只要 baseUrl / apiKey / model 变了就重新生成，复制出来的代码和页面上显示的一致。
 */

export interface Sample {
  title: string;
  code: string;
}

export interface SampleGroups {
  curl: Sample[];
  python: Sample[];
  node: Sample[];
  sdk: Sample[];
  agents: Sample[];
}

export function buildSamples(baseUrl: string, apiKey: string, model: string): SampleGroups {
  return {
    curl: [
      {
        title: 'Chat Completions',
        code: `curl -X POST ${baseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
  "model": "${model}",
  "messages": [{"role": "user", "content": "你好"}],
  "stream": false
}'`,
      },
      {
        title: 'Function Calling',
        code: `curl -X POST ${baseUrl}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
  "model": "${model}",
  "messages": [{"role": "user", "content": "北京今天天气怎么样？"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "查询指定城市的天气",
      "parameters": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'`,
      },
      {
        title: 'Responses API',
        code: `curl -X POST ${baseUrl}/responses \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
  "model": "${model}",
  "input": "北京今天天气怎么样？",
  "tools": [{
    "type": "function",
    "name": "get_weather",
    "description": "查询指定城市的天气",
    "parameters": {
      "type": "object",
      "properties": {"city": {"type": "string"}},
      "required": ["city"]
    }
  }],
  "stream": false
}'`,
      },
    ],

    python: [
      {
        title: 'Chat Completions',
        code: `import requests

resp = requests.post(
    "${baseUrl}/chat/completions",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "model": "${model}",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": False
    }
)
print(resp.json()["choices"][0]["message"]["content"])`,
      },
      {
        title: 'Responses API',
        code: `import requests

resp = requests.post(
    "${baseUrl}/responses",
    headers={"Authorization": "Bearer ${apiKey}"},
    json={
        "model": "${model}",
        "input": "你好",
        "stream": False
    }
)
data = resp.json()
for item in data["output"]:
    if item["type"] == "message":
        print(item["content"][0]["text"])`,
      },
    ],

    node: [
      {
        title: 'Chat Completions',
        code: `const resp = await fetch("${baseUrl}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    model: "${model}",
    messages: [{ role: "user", content: "你好" }],
    stream: false
  })
});
const data = await resp.json();
console.log(data.choices[0].message.content);`,
      },
      {
        title: 'Function Calling',
        code: `const resp = await fetch("${baseUrl}/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    model: "${model}",
    messages: [{ role: "user", content: "北京今天天气怎么样？" }],
    tools: [{
      type: "function",
      function: {
        name: "get_weather",
        description: "查询指定城市的天气",
        parameters: {
          type: "object",
          properties: { city: { type: "string" } },
          required: ["city"]
        }
      }
    }],
    stream: false
  })
});
const data = await resp.json();
const msg = data.choices[0].message;
if (msg.tool_calls) {
  msg.tool_calls.forEach(c => console.log(c.function.name, c.function.arguments));
}`,
      },
    ],

    sdk: [
      {
        title: 'OpenAI SDK（Python）· Chat Completions + 工具循环',
        code: `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}",
    api_key="${apiKey}"
)

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "查询指定城市的天气",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    },
}]

response = client.chat.completions.create(
    model="${model}",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
)

msg = response.choices[0].message
if msg.tool_calls:
    for call in msg.tool_calls:
        print(call.function.name, call.function.arguments)

# 把工具结果喂回去，继续对话
response2 = client.chat.completions.create(
    model="${model}",
    messages=[
        {"role": "user", "content": "北京今天天气怎么样？"},
        msg,
        {"role": "tool", "tool_call_id": msg.tool_calls[0].id, "content": "晴，25°C"},
    ],
    tools=tools,
)
print(response2.choices[0].message.content)`,
      },
      {
        title: 'OpenAI SDK（Node.js）· Responses API',
        code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "${baseUrl}",
  apiKey: "${apiKey}",
});

const resp = await client.responses.create({
  model: "${model}",
  input: "你好",
});

for (const item of resp.output) {
  if (item.type === "message") {
    console.log(item.content[0].text);
  }
}`,
      },
    ],

    agents: [
      {
        title: 'OpenAI Agents SDK（Python）· 函数工具',
        code: `import os

# 设置中转地址与密钥（Agent SDK 底层走 OpenAI 客户端）
os.environ["OPENAI_BASE_URL"] = "${baseUrl}"
os.environ["OPENAI_API_KEY"] = "${apiKey}"

from agents import Agent, Runner, function_tool

@function_tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    return f"{city} 晴，25°C"

agent = Agent(
    name="助手",
    instructions="你是助手，可调用工具回答天气等问题。",
    model="${model}",
    tools=[get_weather],
)

result = Runner.run_sync(agent, "北京今天天气怎么样？")
print(result.final_output)`,
      },
      {
        title: 'LangChain（Python）· ChatOpenAI + 工具绑定',
        code: `from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """查询指定城市的天气"""
    return f"{city} 晴，25°C"

llm = ChatOpenAI(
    base_url="${baseUrl}",
    api_key="${apiKey}",
    model="${model}",
    temperature=0,
)
llm = llm.bind_tools([get_weather])
resp = llm.invoke("北京今天天气怎么样？")
print(resp.tool_calls)   # 工具调用结果
print(resp.content)`,
      },
      {
        title: 'OpenCode · 配置自定义模型提供商',
        code: `// ~/.config/opencode/opencode.json
{
  "provider": {
    "relayhub": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "RelayHub",
      "options": {
        "baseURL": "${baseUrl}",
        "apiKey": "${apiKey}"
      },
      "models": {
        "${model}": { "name": "DeepSeek V4.1 Flash" }
      }
    }
  }
}`,
      },
    ],
  };
}
