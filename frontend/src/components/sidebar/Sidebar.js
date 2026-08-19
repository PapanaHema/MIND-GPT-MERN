import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useRef, useState } from "react";
import { Context } from "../../context/Context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const Sidebar = () => {
	const [extended, setExtended] = useState(false);
	const [panel, setPanel] = useState(null);
	const { user, updateProfilePicture, removeProfilePicture } = useAuth();
	const profileInputRef = useRef(null);
	const [profileMessage, setProfileMessage] = useState("");
	const [profileError, setProfileError] = useState("");
	const [profileBusy, setProfileBusy] = useState(false);
	const { theme, setTheme } = useTheme();
	const {
		history,
		openConversation,
		deleteConversation,
		clearHistory,
		newChat,
		typingSpeed,
		setTypingSpeed,
		speechLanguage,
		setSpeechLanguage,
	} = useContext(Context);

	const openSavedConversation = (conversation) => {
		openConversation(conversation);
		setPanel(null);
	};

	const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));

	const handleProfilePicture = (event) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		setProfileError("");
		setProfileMessage("");
		if (!file) return;
		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			setProfileError("Choose a JPG, PNG, or WebP image.");
			return;
		}
		if (file.size > 2 * 1024 * 1024) {
			setProfileError("Profile picture must be smaller than 2 MB.");
			return;
		}
		const reader = new FileReader();
		reader.onload = async () => {
			setProfileBusy(true);
			try {
				await updateProfilePicture(String(reader.result));
				setProfileMessage("Profile picture updated.");
			} catch (error) {
				setProfileError(error.message);
			} finally {
				setProfileBusy(false);
			}
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveProfilePicture = async () => {
		setProfileBusy(true);
		setProfileError("");
		setProfileMessage("");
		try {
			await removeProfilePicture();
			setProfileMessage("Profile picture removed.");
		} catch (error) {
			setProfileError(error.message);
		} finally {
			setProfileBusy(false);
		}
	};

	return (
		<>
			<aside className={`sidebar ${extended ? "extended" : ""}`}>
				<div className="top">
					<button className="sidebar-icon-button menu" type="button" onClick={() => setExtended((previous) => !previous)} aria-label="Toggle sidebar">
						<img src={assets.menu_icon} alt="" />
					</button>
					<button className="new-chat" type="button" onClick={newChat} aria-label="New chat">
						<img src={assets.plus_icon} alt="" />
						{extended && <span>New Chat</span>}
					</button>
					{extended && (
						<div className="recent">
							<p className="recent-title">Recent</p>
							{history.slice(0, 6).map((item) => (
								<button key={item.id} type="button" onClick={() => openConversation(item)} className="recent-entry">
									<img src={assets.message_icon} alt="" />
									<span>{item.prompt}</span>
								</button>
							))}
							{history.length === 0 && <p className="empty-recent">No conversations yet</p>}
						</div>
					)}
				</div>
				<div className="bottom">
					<button className="bottom-item recent-entry" type="button" onClick={() => setPanel("history")} aria-label="History">
						<img src={assets.history_icon} alt="" />
						{extended && <span>History</span>}
					</button>
					<button className="bottom-item recent-entry" type="button" onClick={() => setPanel("settings")} aria-label="Settings">
						<img src={assets.setting_icon} alt="" />
						{extended && <span>Settings</span>}
					</button>
				</div>
			</aside>

			{panel && (
				<div className="side-panel-overlay" role="presentation" onMouseDown={(event) => {
					if (event.target === event.currentTarget) setPanel(null);
				}}>
					<section className="side-panel" role="dialog" aria-modal="true" aria-label={panel === "history" ? "Chat history" : "Settings"}>
						<header className="side-panel-header">
							<div>
								<h2>{panel === "history" ? "Chat history" : "Settings"}</h2>
								<p>{panel === "history" ? "Your conversations are saved on this device." : "Personalize your MindGPT experience."}</p>
							</div>
							<button type="button" onClick={() => setPanel(null)} aria-label="Close panel">×</button>
						</header>

						{panel === "history" ? (
							<div className="history-panel-content">
								{history.length > 0 && (
									<button className="clear-history-button" type="button" onClick={clearHistory}>Clear all history</button>
								)}
								<div className="history-list">
									{history.map((conversation) => (
										<article className="history-item" key={conversation.id}>
											<button className="history-open" type="button" onClick={() => openSavedConversation(conversation)}>
												<strong>{conversation.prompt}</strong>
												<span>{formatDate(conversation.createdAt)}{conversation.mediaType ? ` · ${conversation.mediaType}` : ""}</span>
											</button>
											<button className="history-delete" type="button" onClick={() => deleteConversation(conversation.id)} aria-label={`Delete ${conversation.prompt}`}>×</button>
										</article>
									))}
									{history.length === 0 && (
										<div className="history-empty">
											<img src={assets.history_icon} alt="" />
											<h3>No chat history</h3>
											<p>Your new MindGPT conversations will appear here.</p>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="settings-content">
								<div className="account-setting">
									{user.profilePicture ? (
										<img className="account-avatar account-photo" src={user.profilePicture} alt={user.name} />
									) : (
										<div className="account-avatar">{user.name.charAt(0).toUpperCase()}</div>
									)}
									<div className="account-details"><strong>{user.name}</strong><span>{user.email}</span></div>
								</div>
								<div className="profile-picture-setting">
									<div><strong>Profile picture</strong><small>JPG, PNG or WebP, up to 2 MB</small></div>
									<div className="profile-picture-actions">
										<input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfilePicture} hidden />
										<button type="button" onClick={() => profileInputRef.current?.click()} disabled={profileBusy}>
											{profileBusy ? "Saving..." : user.profilePicture ? "Change photo" : "Add photo"}
										</button>
										{user.profilePicture && <button className="remove-photo" type="button" onClick={handleRemoveProfilePicture} disabled={profileBusy}>Remove</button>}
									</div>
								</div>
								{profileMessage && <p className="profile-message">{profileMessage}</p>}
								{profileError && <p className="profile-error">{profileError}</p>}
								<label className="setting-row">
									<span><strong>Appearance</strong><small>Choose the app color theme</small></span>
									<select value={theme} onChange={(event) => setTheme(event.target.value)}>
										<option value="light">Light</option>
										<option value="dark">Dark</option>
									</select>
								</label>
								<label className="setting-row">
									<span><strong>Response animation</strong><small>Control how quickly answers appear</small></span>
									<select value={typingSpeed} onChange={(event) => setTypingSpeed(event.target.value)}>
										<option value="normal">Normal</option>
										<option value="fast">Fast</option>
										<option value="instant">Instant</option>
									</select>
								</label>
								<label className="setting-row">
									<span><strong>Speech language</strong><small>Language used by microphone input</small></span>
									<select value={speechLanguage} onChange={(event) => setSpeechLanguage(event.target.value)}>
										<option value="en-US">English (US)</option>
										<option value="en-IN">English (India)</option>
										<option value="hi-IN">Hindi</option>
										<option value="te-IN">Telugu</option>
										<option value="ta-IN">Tamil</option>
										<option value="kn-IN">Kannada</option>
									</select>
								</label>
								<p className="settings-note">Settings and history are stored locally for this account.</p>
							</div>
						)}
					</section>
				</div>
			)}
		</>
	);
};

export default Sidebar;
