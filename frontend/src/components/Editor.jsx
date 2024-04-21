import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

const Editor = ({socketRef, roomId, onCodeChange}) => {
    const editorRef = useRef(null);

    const ACTIONS = {
        JOIN: 'join',
        JOINED: 'joined',
        DISCONNECTED: 'disconnected',
        CODE_CHANGE: 'code-change',
        SYNC_CODE: 'sync-code',
        LEAVE: 'leave',
    };

    useEffect(() => {
        async function init() {
            const textarea = document.getElementById('realtimeEditor');
            editorRef.current = Codemirror.fromTextArea(textarea, {
                mode: 'javascript',
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });

            editorRef.current.on('change', (instance, changes) => {
                console.log('changes', changes);
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });

        }

        init();

    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }

    }, [socketRef.current]);

    return (
        <textarea id='realtimeEditor'></textarea>
    );
}

export default Editor;
