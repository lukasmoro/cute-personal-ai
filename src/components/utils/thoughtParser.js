export const parseThought = (thought) => {
    const markers = {
      gesture: [],
      mimic: [],
      text: thought
    };
    
    // extract markers & content
    const markerRegex = /\[([\w]+):\s*([\w\s]+)\]/g;
    const matches = [...thought.matchAll(markerRegex)];
    
    // store markers by type
    matches.forEach(match => {
      const [, type, content] = match;
      if (markers[type]) {
        markers[type].push({
          content: content.trim(),
          index: match.index
        });
      }
    });
    
    // clean text by removing all markers
    markers.text = thought.replace(markerRegex, '').trim();
    return markers;
  };