const createTimer = () => {
  let timeInMilisecond = 1;

  const incrementMilisecond = () => (timeInMilisecond += 10);
  const timer = setInterval(incrementMilisecond, 10);
  const stopTimer = () => clearInterval(timer);

  return {
    stopTimer,
    get timeInMilisecond() {
      return timeInMilisecond;
    },
    get timeInSecond() {
      return timeInMilisecond / 1000;
    },
  };
};

export { createTimer };
