// GitHub Pages has no server. All requests below are a local-only simulation.
if (location.hostname.endsWith('.github.io')) {
  const nativeFetch=window.fetch.bind(window);
  const services=[{id:'assessment',name:'تقييم تمريضي',price:35000,icon:'✚',color:'mint'},{id:'wound',name:'تضميد الجروح',price:45000,icon:'✳',color:'peach'},{id:'vitals',name:'قياس العلامات الحيوية',price:25000,icon:'♡',color:'blue'},{id:'elderly',name:'رعاية كبار السن',price:50000,icon:'♧',color:'lavender'},{id:'injection',name:'الحقن والأدوية',price:30000,icon:'◇',color:'yellow',order:true},{id:'postop',name:'رعاية ما بعد العملية',price:55000,icon:'✺',color:'pink',order:true}];
  const nurses=[{id:'n1',name:'سارة أحمد',initials:'س',gender:'female',rating:'4.9',visits:128,area:'المنصور',skills:services.map(x=>x.id)},{id:'n2',name:'علي حسن',initials:'ع',gender:'male',rating:'4.8',visits:96,area:'الكرادة',skills:['assessment','wound','vitals','elderly']},{id:'n3',name:'مريم خالد',initials:'م',gender:'female',rating:'4.9',visits:74,area:'زيونة',skills:['assessment','vitals','elderly']}];
  const clinics=[{id:'c1',name:'عيادة النخيل التجريبية',specialty:'طب الأسرة',doctor:'د. ليلى سالم',area:'المنصور',price:30000,slots:['09:00','10:00','11:00','16:00']},{id:'c2',name:'مركز دجلة التجريبي',specialty:'الأمراض الباطنية',doctor:'د. أحمد فاضل',area:'الكرادة',price:40000,slots:['09:30','10:30','12:00','17:00']},{id:'c3',name:'عيادة الندى التجريبية',specialty:'الأطفال',doctor:'د. مريم حسن',area:'زيونة',price:35000,slots:['10:00','11:00','15:00','16:00']}];
  // Memory only: no patient or address data is stored after this tab is closed.
  const data={services,nurses,clinics,bookings:[],appointments:[],verifications:[{id:'v1',name:'نور علي',license:'DEMO-1042',status:'pending'}],audit:[]};
  const result=(value,status=200)=>Promise.resolve(new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}}));
  const error=(text,status=400)=>result({error:text},status);
  window.fetch=function(url,opts={}){
    if(typeof url!=='string'||!url.startsWith('/api/'))return nativeFetch(url,opts);
    if(url==='/api/state')return result(data);
    let b;try{b=JSON.parse(opts.body||'{}')}catch{return error('بيانات غير صالحة')}
    if(url==='/api/bookings'){
      const s=services.find(x=>x.id===b.serviceId);
      if(!s||!b.address?.trim()||!b.area||!b.consent||!['now','scheduled'].includes(b.schedule)||(b.schedule==='scheduled'&&(!Number.isFinite(Date.parse(b.date))||Date.parse(b.date)<=Date.now())))return error('يرجى إكمال البيانات المطلوبة بشكل صحيح.');
      if(b.emergency!==false)return error('في الحالات الطارئة اتصل بالإسعاف أو توجه للطوارئ.');
      if(s.order&&!b.order)return error('هذه الخدمة تتطلب أمراً طبياً صالحاً ومراجعة سريرية.');
      const n=nurses.find(n=>n.skills.includes(s.id)&&(!b.gender||b.gender==='any'||n.gender===b.gender)&&!data.bookings.some(x=>x.nurseId===n.id&&!['cancelled','confirmed'].includes(x.status)));
      const x={id:crypto.randomUUID().slice(0,8),serviceId:s.id,service:s.name,price:s.price,area:b.area,address:b.address,status:n?'offered':'pending',nurseId:n?.id||null};data.bookings.unshift(x);return result(x,201);
    }
    if(url==='/api/appointments'){
      const c=clinics.find(x=>x.id===b.clinicId);if(!c||!c.slots.includes(b.slot)||!b.consent||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!Number.isFinite(Date.parse(`${b.date}T${b.slot}:00+03:00`))||Date.parse(`${b.date}T${b.slot}:00+03:00`)<=Date.now())return error('اختار موعداً مستقبلياً صالحاً.');
      if(data.appointments.some(x=>x.clinicId===c.id&&x.date===b.date&&x.slot===b.slot&&x.status!=='cancelled'))return error('هذا الموعد محجوز في هذه المحاكاة.',409);
      const x={id:crypto.randomUUID().slice(0,8),clinicId:c.id,clinic:c.name,doctor:c.doctor,price:c.price,date:b.date,slot:b.slot,status:'pending'};data.appointments.unshift(x);return result(x,201);
    }
    if(url==='/api/verifications'){if(typeof b.name!=='string'||b.name.trim().length<3||!/^DEMO-[A-Z0-9-]{3,30}$/i.test(b.license||''))return error('أدخل بيانات تجريبية صحيحة.');const x={id:crypto.randomUUID().slice(0,8),name:b.name,license:b.license,status:'pending'};data.verifications.unshift(x);return result(x,201)}
    let m=url.match(/^\/api\/(bookings|appointments|verifications)\/([^/]+)\/(transition|review)$/);
    if(m){const x=data[m[1]].find(item=>item.id===m[2]);if(!x)return error('غير موجود',404);const transitions=m[1]==='bookings'?{offered:['accepted','cancelled'],pending:['cancelled'],accepted:['arrived','cancelled'],arrived:['in_progress'],in_progress:['completed'],completed:['confirmed']}:m[1]==='appointments'?{pending:['accepted','cancelled'],accepted:['completed','cancelled']}:{pending:['approved','rejected']};if(!transitions[x.status]?.includes(b.status))return error('لا يمكن تغيير الحالة.',409);x.status=b.status;return result(x)}
    return error('غير موجود',404);
  };
  document.addEventListener('DOMContentLoaded',()=>{const banner=document.createElement('div');banner.setAttribute('role','status');banner.style.cssText='background:#fff2d5;color:#684b0c;padding:12px;text-align:center;font:700 14px Tajawal,sans-serif;line-height:1.6';banner.textContent='نسخة عرض فقط على GitHub Pages — لا توجد حجوزات أو حسابات أو ممرضون حقيقيون. لا تدخل أي بيانات شخصية أو طبية. البيانات مؤقتة داخل التبويب.';document.body.prepend(banner)});
}
