import { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
const Main = () => {
	const { user, logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const {
		onSent,
		recentPrompt,
		showResults,
		loading,
		resultData,
		setInput,
		input,
		selectedMedia,
		setSelectedMedia,
		speechLanguage,
	} = useContext(Context);
	const fileInputRef = useRef(null);
	const recognitionRef = useRef(null);
	const cameraVideoRef = useRef(null);
	const cameraStreamRef = useRef(null);
	const [isListening, setIsListening] = useState(false);
	const [cameraOpen, setCameraOpen] = useState(false);
	const [cameraReady, setCameraReady] = useState(false);
	const [cameraFacing, setCameraFacing] = useState("environment");
	const [mediaError, setMediaError] = useState("");

	const stopCamera = () => {
		cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
		cameraStreamRef.current = null;
		if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
		setCameraReady(false);
		setCameraOpen(false);
	};

	useEffect(() => () => {
		cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
	}, []);

	const handleCardClick = (promptText) => {
		setInput(promptText);
	};

	const handleSubmit = () => {
		if (input.trim() || selectedMedia) {
			onSent();
		}
	};

	const handleMediaChange = (event) => {
		const file = event.target.files?.[0];
		setMediaError("");
		if (!file) return;
		const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		const videoTypes = [
			"video/mp4",
			"video/mpeg",
			"video/quicktime",
			"video/avi",
			"video/x-msvideo",
			"video/x-flv",
			"video/webm",
			"video/wmv",
			"video/x-ms-wmv",
			"video/3gpp",
		];
		const kind = imageTypes.includes(file.type) ? "image" : videoTypes.includes(file.type) ? "video" : null;
		if (!kind) {
			setMediaError("Choose a supported image or video file.");
			return;
		}
		const maxBytes = kind === "video" ? 12 * 1024 * 1024 : 7 * 1024 * 1024;
		if (file.size > maxBytes) {
			setMediaError(`Choose a ${kind} smaller than ${kind === "video" ? "12" : "7"} MB.`);
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = String(reader.result);
			const normalizedMimeType = file.type === "video/x-msvideo"
				? "video/avi"
				: file.type === "video/x-ms-wmv"
					? "video/wmv"
					: file.type;
			setSelectedMedia({
				name: file.name,
				kind,
				mimeType: normalizedMimeType,
				data: dataUrl.split(",")[1],
				preview: dataUrl,
			});
			event.target.value = "";
		};
		reader.readAsDataURL(file);
	};

	const toggleMicrophone = async () => {
		setMediaError("");
		if (isListening) {
			recognitionRef.current?.stop();
			return;
		}
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			setMediaError("Speech recognition is not supported in this browser. Try Chrome.");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((track) => track.stop());
			const recognition = new SpeechRecognition();
			recognition.lang = speechLanguage;
			recognition.interimResults = true;
			recognition.continuous = false;
			recognition.onstart = () => setIsListening(true);
			recognition.onend = () => setIsListening(false);
			recognition.onerror = () => {
				setIsListening(false);
				setMediaError("Microphone input failed. Check your browser permission.");
			};
			recognition.onresult = (event) => {
				const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
				setInput(transcript);
			};
			recognitionRef.current = recognition;
			recognition.start();
		} catch {
			setMediaError("Microphone permission was denied. Allow access in browser settings.");
		}
	};

	const startCamera = async (facingMode = cameraFacing) => {
		setMediaError("");
		if (!navigator.mediaDevices?.getUserMedia) {
			setMediaError("Camera access is not supported in this browser.");
			return;
		}
		cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
		setCameraOpen(true);
		setCameraReady(false);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: facingMode } },
				audio: false,
			});
			cameraStreamRef.current = stream;
			if (cameraVideoRef.current) {
				cameraVideoRef.current.srcObject = stream;
				await cameraVideoRef.current.play();
				setCameraReady(true);
			}
		} catch {
			setCameraOpen(false);
			setMediaError("Camera permission was denied. Allow camera access in browser settings.");
		}
	};

	const switchCamera = () => {
		const nextFacing = cameraFacing === "environment" ? "user" : "environment";
		setCameraFacing(nextFacing);
		startCamera(nextFacing);
	};

	const capturePhoto = () => {
		const video = cameraVideoRef.current;
		if (!video?.videoWidth || !video?.videoHeight) {
			setMediaError("The camera is still starting. Please try again.");
			return;
		}
		const canvas = document.createElement("canvas");
		const maxWidth = 1600;
		const scale = Math.min(1, maxWidth / video.videoWidth);
		canvas.width = Math.round(video.videoWidth * scale);
		canvas.height = Math.round(video.videoHeight * scale);
		canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
		setSelectedMedia({
			name: `camera-${Date.now()}.jpg`,
			kind: "image",
			mimeType: "image/jpeg",
			data: dataUrl.split(",")[1],
			preview: dataUrl,
		});
		stopCamera();
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleSubmit();
		}
	};
	return (
		<div className="main">
			<div className="nav">
				<p>MindGPT</p>
				<div className="user-menu">
					<div><strong>{user.name}</strong><span>{user.email}</span></div>
					<button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
						<span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
					</button>
					<img src={user.profilePicture || assets.user} alt={user.name} />
					<button className="logout-button" type="button" onClick={logout}>Log out</button>
				</div>
			</div>
			<div className="main-container">
				{!showResults ? (
					<>
						<div className="greet">
							<p>
								<span>Hello, {user.name.split(" ")[0]}</span>
							</p>
							<p>How Can i Help You Today?</p>
						</div>
						<div className="cards">
							<div
								className="card"
								onClick={() =>
									handleCardClick("Suggest Some Place To Visit In India.")
								}
							>
								<p>Suggest Some Place To Visit In India.</p>
								<img src={assets.compass_icon} alt="" />
							</div>
							<div
								className="card"
								onClick={() =>
									handleCardClick(
										"Explain the process of photosynthesis in simple terms"
									)
								}
							>
								<p>Explain the process of photosynthesis in simple terms </p>
								<img src={assets.message_icon} alt="" />
							</div>
							<div
								className="card"
								onClick={() =>
									handleCardClick("How do you create a responsive navbar using CSS and JavaScript?")
								}
							>
								<p>How do you create a responsive navbar using CSS and JavaScript?</p>
								<img src={assets.bulb_icon} alt="" />
							</div>
							<div
								className="card"
								onClick={() => {
									handleCardClick(
										"What are some essential skills for becoming a front-end developer?"
									);
								}}
							>
								<p>What are some essential skills for becoming a front-end developer?</p>
								<img src={assets.code_icon} alt="" />
							</div>
						</div>
					</>
				) : (
					<div className="result">
						<div className="result-title">
							<img src={user.profilePicture || assets.user} alt={user.name} />
							<p>{recentPrompt}</p>
						</div>
						<div className="result-data">
							<img src={assets.gemini_icon} alt="" />
							{loading ? (
								<div className="loader">
									<hr />
									<hr />
									<hr />
								</div>
							) : (
								<p dangerouslySetInnerHTML={{ __html: resultData }}></p>
							)}
						</div>
					</div>
				)}

				<div className="main-bottom">
					{selectedMedia && (
						<div className="image-preview">
							{selectedMedia.kind === "video" ? (
								<video src={selectedMedia.preview} controls muted aria-label={selectedMedia.name} />
							) : (
								<img src={selectedMedia.preview} alt={selectedMedia.name} />
							)}
							<div className="attachment-details">
								<span>{selectedMedia.name}</span>
								<small>{selectedMedia.kind === "video" ? "Video ready for analysis" : "Image ready for analysis"}</small>
							</div>
							<button type="button" onClick={() => setSelectedMedia(null)} aria-label="Remove attachment">×</button>
						</div>
					)}
					<div className="search-box">
						<input
							onChange={(e) => {
								setInput(e.target.value);
							}}
							value={input}
							type="text"
							placeholder="Enter the Prompt Here"
							onKeyDown={handleKeyDown}
						/>
						<div>
							<input ref={fileInputRef} className="file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/mpeg,video/quicktime,video/avi,video/x-msvideo,video/x-flv,video/webm,video/wmv,video/x-ms-wmv,video/3gpp,.avi,.wmv" onChange={handleMediaChange} />
							<button type="button" className="icon-button" onClick={() => fileInputRef.current?.click()} aria-label="Upload photo or video">
								<img src={assets.gallery_icon} alt="" />
							</button>
							<button type="button" className="icon-button camera-button" onClick={() => startCamera()} aria-label="Open camera" title="Open camera">
								<span aria-hidden="true">●</span>
							</button>
							<button type="button" className={`icon-button ${isListening ? "listening" : ""}`} onClick={toggleMicrophone} aria-label={isListening ? "Stop listening" : "Use microphone"}>
								<img src={assets.mic_icon} alt="" />
							</button>
							<img
								src={assets.send_icon}
								alt="Send prompt"
								onClick={handleSubmit}
							/>
						</div>
					</div>
					{mediaError && <p className="media-error">{mediaError}</p>}
					{isListening && <p className="listening-status">Listening… speak now</p>}
					<div className="bottom-info">
						<p>
							MindGPT may display inaccurate information, including about
							people, so double-check its responses.
						</p>
					</div>
				</div>
			</div>
			{cameraOpen && (
				<div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Camera">
					<div className="camera-modal">
						<div className="camera-header">
							<div><strong>Take a photo</strong><span>Capture an image for MindGPT to analyze.</span></div>
							<button type="button" onClick={stopCamera} aria-label="Close camera">×</button>
						</div>
						<div className="camera-view">
							<video ref={cameraVideoRef} autoPlay playsInline muted />
							{!cameraReady && <div className="camera-loading">Starting camera…</div>}
						</div>
						<div className="camera-actions">
							<button className="camera-secondary" type="button" onClick={switchCamera}>Switch camera</button>
							<button className="capture-button" type="button" onClick={capturePhoto} disabled={!cameraReady}>
								<span aria-hidden="true"></span>
								Capture photo
							</button>
							<button className="camera-secondary" type="button" onClick={stopCamera}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Main;
