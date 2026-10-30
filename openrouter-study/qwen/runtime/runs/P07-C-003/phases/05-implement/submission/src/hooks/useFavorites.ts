import { useEffect, useState, useCallback } from "react"

const STORAGE_KEY = "folio:favorites:v1"
const VERSION_CHECK = "version"
const IDS_CHECK = "ids"

function loadFavorites():string[]{
  try{
    const stored=localStorage.getItem(STORAGE_KEY)
    if(!stored)return[]
    const data=JSON.parse(stored)
    if(data&&typeof data==="object"&&data[VERSION_CHECK]===1&&Array.isArray(data[IDS_CHECK])&&data[IDS_CHECK].every((id)=>typeof id==="string")){
      return Array.from(new Set(data[IDS_CHECK])).sort()
    }
  }catch{}
  return[]
}

function saveFavorites(ids:string[]):void{
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,ids:ids}))}catch{}
}

export type Project={id:string;name:string}
export type Task={id:string;projectId:string;title:string;description:string;status:string;assignee:string;dueDate:string}

export function useFavorites(projectId?:string){
  const[favorites,setFavorites]=useState<string[]>(loadFavorites())

  useEffect(()=>{
    const handleStorage=(event:StorageEvent)=>{
      if(event.key===STORAGE_KEY&&event.newValue!==null){
        try{
          const data=JSON.parse(event.newValue)
          if(data&&typeof data==="object"&&(data as any)[IDS_CHECK]){
            const parsed=(data as any)[IDS_CHECK]
            setFavorites(Array.from(new Set(parsed)).sort())
          }
        }catch{}
      }
    }
    window.addEventListener("storage",handleStorage)
    return()=>window.removeEventListener("storage",handleStorage)
  },[])

  useEffect(()=>{
    saveFavorites(favorites)
  },[favorites])

  const toggleFavorite=useCallback((taskId:string)=>{
    setFavorites((prev)=>{
      const has=prev.includes(taskId)
      const next=has?prev.filter((id)=>id!==taskId):[...prev,taskId].sort()
      saveFavorites(next)
      return next
    })
  },[])

  const removeMany=useCallback((taskIds:string[])=>{
    setFavorites((prev)=>{
      const next=prev.filter((id)=>!taskIds.includes(id))
      saveFavorites(next)
      return next
    })
  },[])

  return{favorites,toggleFavorite,removeMany}
}
