import { useEffect, useRef, useState } from 'react';
import Container from 'reactstrap/lib/Container';
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
    <div>
      <div ref={headerRef} className='lead text-center'>
        <h1 className='display-4'>Campaign Editor</h1>
        <p>On this screen you can setup or edit a campaign.</p>
      </div>
      <div className='overflow-auto' style={{ height: editorHeight, paddingBottom: '200px' }}>
        <Container>
          <CampaignForm />
        </Container>
      </div>
    </div>
  );
}
