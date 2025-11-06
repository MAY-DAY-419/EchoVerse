// Echo Card Component for EchoVerse
// Handles display and interaction with individual echoes

/**
 * Creates an echo card element
 * @param {Object} echo - Echo data object
 * @returns {HTMLElement} Echo card element
 */
export function createEchoCard(echo) {
  const card = document.createElement('div');
  card.className = 'echo-card';
  card.dataset.echoId = echo.id;
  
  // Apply mood color if available
  if (echo.moodColor) {
    card.style.borderLeftColor = echo.moodColor;
    card.style.background = `linear-gradient(135deg, ${echo.moodColor}08, transparent)`;
  }

  card.innerHTML = `
    <div class="echo-header">
      <div class="echo-meta">
        <span class="emotion-badge" style="background: ${getEmotionGradient(echo.emotionTag)}">
          <span class="emotion-icon">${getEmotionIcon(echo.emotionTag)}</span>
          <span class="emotion-text">${echo.emotionTag}</span>
        </span>
        ${echo.authorName ? `<span class="author-name">${echo.authorName}</span>` : ''}
      </div>
      <span class="echo-timestamp" title="${formatFullTimestamp(echo.createdAt)}">
        ${echo.relativeTime}
      </span>
    </div>
    
    <div class="echo-content">
      ${formatEchoContent(echo.content)}
    </div>
    
    <div class="echo-actions">
      <button class="action-btn ripple-btn" data-action="ripple" data-echo-id="${echo.id}">
        <span class="act