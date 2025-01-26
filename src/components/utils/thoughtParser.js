export const parseThought = (thought) => {
  const WORDS_PER_MINUTE = 1400;
  const MS_PER_WORD = (60 * 1000) / WORDS_PER_MINUTE;

  const markers = {
    gesture: [],
    mimic: [],
    action: [],
    text: thought,
    timeline: [],
  };

  const markerRegex = /\[([\w]+):\s*([\w\s:/.&]+)\]/g;
  const matches = [...thought.matchAll(markerRegex)];

  const cleanText = thought.replace(markerRegex, "").trim();
  markers.text = cleanText;

  const words = cleanText.split(/\s+/);
  let currentWordIndex = 0;
  let currentTime = 0;

  const charToWordMap = new Map();
  let charIndex = 0;
  words.forEach((word, wordIndex) => {
    for (let i = 0; i < word.length; i++) {
      charToWordMap.set(charIndex + i, wordIndex);
    }
    charIndex += word.length + 1;
  });

  const sortedMarkers = matches.sort((a, b) => a.index - b.index);

  sortedMarkers.forEach((match) => {
    const [, type, content] = match;

    if (markers[type]) {
      const markerWordIndex = charToWordMap.get(match.index) || 0;
      const timestamp = markerWordIndex * MS_PER_WORD;

      const markerInfo = {
        type,
        content: content.trim(),
        wordIndex: markerWordIndex,
        timestamp,
        word: words[markerWordIndex] || "",
      };

      markers[type].push(markerInfo);
      markers.timeline.push(markerInfo);
    }
  });

  markers.timeline.sort((a, b) => a.timestamp - b.timestamp);
  markers.totalDuration = words.length * MS_PER_WORD;

  return markers;
};
