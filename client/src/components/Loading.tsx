import React from 'react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
}

export default Loading