import { addMinutes, isAfter, isBefore, setHours, setMinutes } from 'date-fns';

const date = new Date();
const currentSlot = setMinutes(setHours(date, 10), 30);
const slotEnd = setMinutes(setHours(date, 11), 0);

const apptStartTime = setMinutes(setHours(date, 10), 0);
const apptEndTime = setMinutes(setHours(date, 10), 30);

const cond1 = isAfter(currentSlot, apptStartTime) && isBefore(currentSlot, apptEndTime);
const cond2 = isAfter(slotEnd, apptStartTime) && isBefore(slotEnd, apptEndTime);
const cond3 = currentSlot.getTime() === apptStartTime.getTime();
const cond4 = (currentSlot.getTime() < apptEndTime.getTime() && slotEnd.getTime() > apptStartTime.getTime());

console.log('Cond1:', cond1);
console.log('Cond2:', cond2);
console.log('Cond3:', cond3);
console.log('Cond4:', cond4);
