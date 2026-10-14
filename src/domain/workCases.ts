import type { BusinessCase, Category, WorkType } from './models';
const categoriesByWorkType:Record<WorkType,string[]>={
  'Freelancer':['software','office','equipment','travel','meals','contractors','other'],
  'Business owner':['office','equipment','contractors','software','travel','meals','other'],
  'Creator':['equipment','software','contractors','studio','travel','office','other'],
  'Athlete':['sport','travel','meals','equipment','software','other'],
  'Musician':['studio','equipment','travel','software','contractors','other'],
  'Other':['software','office','equipment','travel','meals','contractors','studio','sport','other'],
};
export const businessCategories=(workType:WorkType,categories:Category[])=>categoriesByWorkType[workType].map(id=>categories.find(category=>category.id===id)).filter((category):category is Category=>!!category);
export const createBusinessCase=(workType:WorkType,name=defaultBusinessName(workType)):BusinessCase=>({id:'business-'+crypto.randomUUID(),name,workType,categoryIds:categoriesByWorkType[workType]});
export const defaultBusinessName=(workType:WorkType)=>({'Freelancer':'Freelance work','Business owner':'My business','Creator':'Creator business','Athlete':'Athlete work','Musician':'Music business','Other':'Other business'}[workType]);
export const normalizeBusinessCases=<T extends {businessCases?:BusinessCase[];profile:{workType:WorkType|''};transactions:{type:string;classification:string|null;businessCaseId?:string|null}[]}>(records:T):T=>{
 if(records.businessCases?.length)return records;
 if(!records.profile.workType)return {...records,businessCases:[]};
 const workType=records.profile.workType as WorkType,item=createBusinessCase(workType,records.profile.workType==='Business owner'&&'businessName'in records.profile&&typeof records.profile.businessName==='string'&&records.profile.businessName?records.profile.businessName:undefined);
 return {...records,businessCases:[item],transactions:records.transactions.map(t=>t.type==='expense'&&t.classification==='business'&&!t.businessCaseId?{...t,businessCaseId:item.id}:t)};
};
