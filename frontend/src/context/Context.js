import { createContext, useEffect, useRef, useState } from "react";
import runChat from "../config/Gemini";
import { useAuth } from "./AuthContext";

export const Context = createContext();

const formatResponse = (response) => {
	let responseArray = response.split("**");
	let formatted = "";
	for (let i = 0; i < responseArray.length; i++) {
		formatted += i !== 0 && i % 2 === 1 ? `<b>${responseArray[i]}</b>` : responseArray[i];
	}
	return formatted.split("*").join("<br/>");
};

const ContextProvider = ({ children }) => {
	const { user } = useAuth();
	const [input, setInput] = useState("");
	const [recentPrompt, setRecentPrompt] = useState("");
	const [showResults, setShowResults] = useState(false);
	const [loading, setLoading] = useState(false);
	const [resultData, setResultData] = useState("");
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [history, setHistory] = useState([]);
	const [typingSpeed, setTypingSpeed] = useState("normal");
	const [speechLanguage, setSpeechLanguage] = useState("en-US");
	const timersRef = useRef([]);
	const historyKey = user ? `mindgpt_history_${user.id}` : null;
	const settingsKey = user ? `mindgpt_settings_${user.id}` : null;

	useEffect(() => {
		if (!historyKey) {
			setHistory([]);
			return;
		}
		try {
			setHistory(JSON.parse(localStorage.getItem(historyKey) || "[]"));
		} catch {
			setHistory([]);
		}
	}, [historyKey]);

	useEffect(() => {
		if (!settingsKey) return;
		try {
			const saved = JSON.parse(localStorage.getItem(settingsKey) || "{}");
			setTypingSpeed(saved.typingSpeed || "normal");
			setSpeechLanguage(saved.speechLanguage || "en-US");
		} catch {
			setTypingSpeed("normal");
			setSpeechLanguage("en-US");
		}
	}, [settingsKey]);

	useEffect(() => {
		if (settingsKey) {
			localStorage.setItem(settingsKey, JSON.stringify({ typingSpeed, speechLanguage }));
		}
	}, [settingsKey, typingSpeed, speechLanguage]);

	const persistHistory = (nextHistory) => {
		setHistory(nextHistory);
		if (historyKey) localStorage.setItem(historyKey, JSON.stringify(nextHistory));
	};

	const clearTypingTimers = () => {
		timersRef.current.forEach(clearTimeout);
		timersRef.current = [];
	};

	const displayResponse = (formatted) => {
		clearTypingTimers();
		setResultData("");
		if (typingSpeed === "instant") {
			setResultData(formatted);
			return;
		}
		const delay = typingSpeed === "fast" ? 2 : 10;
		formatted.split("").forEach((character, index) => {
			const timer = setTimeout(() => {
				setResultData((previous) => previous + character);
			}, delay * index);
			timersRef.current.push(timer);
		});
	};

	const newChat = () => {
		clearTypingTimers();
		setLoading(false);
		setShowResults(false);
		setInput("");
		setSelectedMedia(null);
		setRecentPrompt("");
		setResultData("");
	};

	const openConversation = (conversation) => {
		clearTypingTimers();
		setRecentPrompt(conversation.prompt);
		setResultData(conversation.response);
		setShowResults(true);
		setLoading(false);
		setSelectedMedia(null);
	};

	const deleteConversation = (id) => persistHistory(history.filter((item) => item.id !== id));
	const clearHistory = () => {
		persistHistory([]);
		newChat();
	};

	const onSent = async (prompt) => {
		clearTypingTimers();
		setResultData("");
		setLoading(true);
		setShowResults(true);
		try {
			const submittedPrompt = prompt !== undefined ? prompt : input.trim();
			if (!submittedPrompt && !selectedMedia) {
				setShowResults(false);
				return;
			}
			const displayPrompt = submittedPrompt ||
				(selectedMedia?.kind === "video" ? "Describe this video" : "Describe this image");
			setRecentPrompt(displayPrompt);
			const response = await runChat(displayPrompt, selectedMedia);
			const formatted = formatResponse(response);
			displayResponse(formatted);

			if (prompt === undefined) {
				const conversation = {
					id: crypto.randomUUID(),
					prompt: displayPrompt,
					response: formatted,
					createdAt: new Date().toISOString(),
					mediaType: selectedMedia?.kind || null,
				};
				persistHistory([conversation, ...history].slice(0, 100));
			}
		} catch (error) {
			console.error("Error while running chat:", error);
			setResultData(error.message || "Something went wrong. Please try again.");
		} finally {
			setLoading(false);
			setInput("");
			setSelectedMedia(null);
		}
	};

	return (
		<Context.Provider value={{
			onSent, recentPrompt, input, setInput, showResults, loading, resultData,
			newChat, selectedMedia, setSelectedMedia, history, openConversation,
			deleteConversation, clearHistory, typingSpeed, setTypingSpeed,
			speechLanguage, setSpeechLanguage,
		}}>
			{children}
		</Context.Provider>
	);
};

export default ContextProvider;
