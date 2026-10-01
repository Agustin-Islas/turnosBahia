import { addDays, addMinutes, format, isAfter, isBefore, parse, startOfDay, setHours, setMinutes } from 'date-fns';

export type TimeSlot = {
  time: string;
  available: boolean;
};

type GetAvailabilityParams = {
  date: Date;
  serviceDuration: number;
  schedule: { startTime: string; endTime: string };
  appointments: { startTime: Date; endTime: Date }[];
  timeOffs: { startDate: Date; endDate: Date }[];
  intervalMinutes?: number;
};

function calculateAvailableSlots({
  date,
  serviceDuration,
  schedule,
  appointments,
  timeOffs,
  intervalMinutes = 30,
}: GetAvailabilityParams): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dayStart = startOfDay(date);
  
  const scheduleStart = parse(schedule.startTime, 'HH:mm', dayStart);
  const scheduleEnd = parse(schedule.endTime, 'HH:mm', dayStart);
  
  let currentSlot = scheduleStart;
  const now = new Date();

  while (isBefore(currentSlot, scheduleEnd)) {
    const slotEnd = addMinutes(currentSlot, serviceDuration);
    
    if (isAfter(slotEnd, scheduleEnd)) {
      break;
    }

    const isPast = isBefore(currentSlot, now);

    const isOverlappingAppointment = appointments.some((appt) => {
      return currentSlot.getTime() < appt.endTime.getTime() && slotEnd.getTime() > appt.startTime.getTime();
    });

    const isOverlappingTimeOff = timeOffs.some((timeOff) => {
      return currentSlot.getTime() < timeOff.endDate.getTime() && slotEnd.getTime() > timeOff.startDate.getTime();
    });

    const isAvailable = !isPast && !isOverlappingAppointment && !isOverlappingTimeOff;

    if (format(currentSlot, 'HH:mm') === '10:30') {
      console.log('--- 10:30 DEBUG ---');
      console.log('isPast:', isPast);
      console.log('isOverlappingAppointment:', isOverlappingAppointment);
      console.log('isOverlappingTimeOff:', isOverlappingTimeOff);
      console.log('currentSlot:', currentSlot);
      console.log('slotEnd:', slotEnd);
      console.log('appt.endTime:', appointments[0]?.endTime);
      console.log('appt.startTime:', appointments[0]?.startTime);
      console.log('timeOff.endDate:', timeOffs[0]?.endDate);
      console.log('timeOff.startDate:', timeOffs[0]?.startDate);
    }

    slots.push({
      time: format(currentSlot, 'HH:mm'),
      available: isAvailable,
    });

    currentSlot = addMinutes(currentSlot, intervalMinutes);
  }

  return slots;
}

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

calculateAvailableSlots({
  date: tomorrow,
  serviceDuration: 30,
  schedule,
  appointments,
  timeOffs,
  intervalMinutes: 30,
});
