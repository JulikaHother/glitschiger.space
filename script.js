document.addEventListener("DOMContentLoaded", () => {
  const kreise = document.querySelectorAll('.kreis');
  let isRecording = false;
  let mediaRecorder;
  let audioChunks = [];

  const checkCollision = (x, y, radius, circles) => {
    for (const circle of circles) {
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius + circle.radius) {
        return true;
      }
    }
    return false;
  };

  const placeKreis = (kreis, placedCircles) => {
    const parent = kreis.parentElement;
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    const kreisWidth = kreis.clientWidth;
    const kreisHeight = kreis.clientHeight;
    const radius = kreisWidth / 2;

    let randomX, randomY;

    do {
      randomX = Math.random() * (parentWidth - kreisWidth);
      randomY = Math.random() * (parentHeight - kreisHeight);
    } while (checkCollision(randomX + radius, randomY + radius, radius, placedCircles));

    kreis.style.left = `${randomX}px`;
    kreis.style.top = `${randomY}px`;

    placedCircles.push({ x: randomX + radius, y: randomY + radius, radius: radius });
  };

  const placedCircles = [];

  kreise.forEach(kreis => {
    placeKreis(kreis, placedCircles);

    let audioUrl;
    let audio;
    let hasAudio = false;
    let originalColor = kreis.style.backgroundColor;

    if (kreis.classList.contains('audio-kreis')) {
      const audioFile = kreis.dataset.audio;
      audioUrl = `./sounds/${audioFile}`;
      audio = new Audio(audioUrl);
      audio.loop = true;
      hasAudio = true;
    }

    kreis.addEventListener('click', async () => {
      if (isRecording && !kreis.classList.contains('audio-kreis')) {
        kreis.style.backgroundColor = originalColor;
        kreis.style.mixBlendMode = 'normal';
        isRecording = false;
        mediaRecorder.stop();
        return;
      }

      if (!audio) {
        if (!isRecording) {
          kreis.style.backgroundColor = 'aqua';
          kreis.style.mixBlendMode = 'difference';
          isRecording = true;
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
          };
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioUrl = URL.createObjectURL(audioBlob);
            audio = new Audio(audioUrl);
            audio.loop = true;
            audioChunks = [];
            hasAudio = true;
          };
          mediaRecorder.start();
        }
      } else {
        if (audio.paused) {
          kreis.style.backgroundColor = 'purple';
          kreis.style.mixBlendMode = 'difference';
          audio.play();
        } else {
          kreis.style.backgroundColor = originalColor;
          kreis.style.mixBlendMode = 'normal';
          audio.pause();
        }
      }
    });
  });
});
