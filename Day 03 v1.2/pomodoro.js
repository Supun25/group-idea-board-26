document.addEventListener('DOMContentLoaded', () => {
    const pomodoroDisplay = document.getElementById('pomodoro-display');
    const pomodoroStartBtn = document.getElementById('pomodoro-start-btn');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset-btn');
    const alarmAudio = document.getElementById('pomodoro-alarm');

    // 25 minutes in seconds
    const timerDuration = 25 * 60;
    let remainingTime = timerDuration;
    let intervalId = null;

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        pomodoroDisplay.textContent = formatTime(remainingTime);
    }

    function startTimer() {
        if (intervalId !== null) return; // already running

        intervalId = setInterval(() => {
            remainingTime--;
            if (remainingTime <= 0) {
                clearInterval(intervalId);
                intervalId = null;
                remainingTime = 0;
                updateDisplay();

                // play alarm sound
                alarmAudio.play().catch(() => {});

                // show notification if possible
                if ("Notification" in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('Pomodoro', { body: "Time's up!" });
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                new Notification('Pomodoro', { body: "Time's up!" });
                            }
                        });
                    }
                } else {
                    alert("Pomodoro timer finished!");
                }
            } else {
                updateDisplay();
            }
        }, 1000);
    }

    function resetTimer() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
        remainingTime = timerDuration;
        updateDisplay();
    }

    pomodoroStartBtn.addEventListener('click', startTimer);
    pomodoroResetBtn.addEventListener('click', resetTimer);

    updateDisplay();
});