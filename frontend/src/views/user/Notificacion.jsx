import React, { useEffect } from 'react'

const Notificacion = ({notification}) => {

  return (
  <div>
    <section>
  <div className="py-8 px-4 mb-5 mx-auto max-w-screen-xl shadow-sm rounded-md lg:py-16 lg:px-6">
      <div className="max-w-screen-lg text-gray-500 sm:text-lg ">
                <h4 className='text-sm italic'>{notification.timestamp}</h4>
       
          <p className="pt-5 mb-4 font-light">{notification.message}</p>
      
      </div>
  </div>
</section>

  </div>

  )
}

export default Notificacion