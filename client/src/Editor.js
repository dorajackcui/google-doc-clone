import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import './styles.css'
import { io } from 'socket.io-client'

const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }],
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block','image'],

  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  // [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  
  [{ 'align': [] }],

  // ['clean']                                         // remove formatting button
];

export default function Editor() {
  const { id: documentId } = useParams()
  const [socket, setSocket] = useState()
  const [quill, setQuill] = useState()
  const SAVE_INTERVAL_MS = 2000

  //1.Connect Server via Socket
  useEffect(()=> {
    const s  = io('http://localhost:5000')
    setSocket(s)

    return () => {
      s.disconnect()
    }
  },[])

  //2.Send to Server Text Change
  useEffect(() => {
    if(socket == null || quill == null) return
    const handler = (delta, oldDelta, source) => {
      if (source !== 'user') return 
      socket.emit('send-changes', delta)
    }

    quill.on('text-change', handler)

    return () => {
      quill.off('text-change', handler)
    }
  },[socket, quill])

  //3.Receive Changed Text
  useEffect(() => {
    if(socket == null || quill == null) return
    const handler = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', handler)

    return () => {
      socket.off('receive-changes', handler)
    }
  },[socket, quill])

  //4.Check DocumentID
  useEffect(() => {
    if(socket == null || quill == null ) return 

    socket.once('load-document', document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document', documentId)
  },[socket, quill, documentId])

  //5.Save Document
  useEffect(() => {
    if(socket == null || quill == null) return
    
    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents())
    }, SAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
    }
  },[socket, quill])
  
  //6.Create Quill Editor
  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return
    wrapper.innerHTML = ''
    
    const editor = document.createElement('div')
    wrapper.append(editor)
    
    const q = new Quill(editor, {
      theme : 'snow', 
      modules:{
        toolbar: TOOLBAR_OPTIONS,
    }})  
    q.disable()
    q.setText('Loading...')
    setQuill(q)
  },[])

  return (

    <div className="container"  ref={wrapperRef}></div>
  )
}
