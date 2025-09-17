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

const pause = (miliSecond: number) =>
  new Promise(resolve => setTimeout(resolve, miliSecond));

export { createTimer, pause };
