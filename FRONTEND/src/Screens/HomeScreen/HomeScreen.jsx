import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import { FeedList } from '../../components/feed/FeedList/FeedList'

export const HomeScreen = () => {

  const { user } = useContext(AuthContext)

  if(!user){
    return <h2>Cargando el muro de MIB...</h2>
  }
  
  return (
    <div style={{ width: '100%' }}>
      <FeedList />
    </div>
  )
}
