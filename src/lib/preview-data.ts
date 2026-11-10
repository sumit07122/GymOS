// PREVIEW DATA ONLY. Replace each export with your existing server queries.
const mo = ["Jun","Jul","Aug","Sep","Oct","Nov"];
export const mrr = mo.map((m,i)=>({m,v:[182,214,238,271,305,342][i]*1000}));
export const revenue = mo.map((m,i)=>({m,v:[96,104,99,121,128,141][i]*1000}));
export const attendance = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((m,i)=>({m,v:[142,128,151,119,163,188,76][i]}));
export const planMix = [{n:"Starter",v:41},{n:"Growth",v:58},{n:"Pro",v:23}];
export const gyms = [{name:"Iron Temple Fitness",city:"Mathura",plan:"Growth",members:312,status:"Active"},{name:"PulseHouse Gym",city:"Agra",plan:"Pro",members:640,status:"Active"},{name:"Core Republic",city:"Noida",plan:"Starter",members:88,status:"Trial"}];
export const alerts = [{gym:"PulseHouse Gym",what:"Members",used:612,cap:640},{gym:"Iron Temple Fitness",what:"WhatsApp messages",used:930,cap:1000},{gym:"Core Republic",what:"Members",used:51,cap:100}];
export const expiring = [{name:"Aarav Sharma",plan:"Quarterly",days:3},{name:"Meera Joshi",plan:"Monthly",days:5},{name:"Rohan Verma",plan:"Annual",days:9}];
export const payments = [{name:"Kavya Singh",what:"Annual plan",amt:"₹14,000",via:"UPI"},{name:"Dev Malhotra",what:"Monthly plan",amt:"₹1,500",via:"Cash"},{name:"Isha Gupta",what:"Quarterly plan",amt:"₹4,000",via:"Card"}];
