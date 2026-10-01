import { calculateAvailableSlots } from '../src/lib/availability';
import { addDays, setHours, setMinutes } from 'date-fns';

const today = new Date();
const tomorrow = addDays(today, 1);

const schedule = { startTime: '09:00', endTime: '14:00' };

const appointments = [
  {
    startTime: setMinutes(setHours(tomorrow, 10), 0),
    endTime: setMinutes(setHours(tomorrow, 10), 30),
  }
];

const timeOffs = [
  {
    startDate: setMinutes(setHours(tomorrow, 12), 0),
    endDate: setMinutes(setHours(tomorrow, 13), 0),
  }
];

const slots = calculateAvailableSlots({
  date: tomorrow,
  serviceDuration: 30,
  schedule,
  appointments,
  timeOffs,
  intervalMinutes: 30,
});

console.log(slots.filter(s => !s.available).map(s => s.time));
