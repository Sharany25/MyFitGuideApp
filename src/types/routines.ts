type RoutineData = {
  [key: string]: {
    title: string;
    category: string;
    duration: string;
    image: string;
    exercises: { name: string; sets: string }[];
  };
};
