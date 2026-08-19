async function runChat(prompt, media) {
  const token = localStorage.getItem("mindgpt_token");
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, media }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Unable to get a response from MindGPT.");
  }

  return data.text;
}

export default runChat;
