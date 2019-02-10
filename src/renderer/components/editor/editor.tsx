import { useEffect, useRef, useState } from 'react';
import CampaignForm from './form';
const React = require('react');

export default function CampaignEditor() {
  const [editorHeight, setEditorHeight] = useState(0);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      setEditorHeight(window.innerHeight - headerRef.current.scrollHeight);
    }
  }, [window.innerHeight]);

  return (
    <div className='container'>
      <div ref={headerRef} className='lead text-center'>
        <h1 className='display-4'>Campaign Editor</h1>
        <p>On this screen you can setup or edit a campaign.</p>
      </div>
      <CampaignForm
        className='overflow-auto pl-2 pr-2'
        style={{ height: editorHeight, paddingBottom: '200px' }} />
    </div>
  );
}
