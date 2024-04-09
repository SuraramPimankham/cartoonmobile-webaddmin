import React from "react";
import PropTypes from "prop-types";
import Modal from 'react-modal';
import { collection, query, where, getDocs, deleteDoc, } from 'firebase/firestore'; // Import Firebase Firestore functions
import { db } from '../firebase'; // Import your Firebase instance

import './css/AlertDeleteEP.css';

Modal.setAppElement('#root');


function AlertDeleteEP({ modalIsOpen, setModalIsOpen, storyId, refEp }) {

    const handleDelete = async () => {
        try {
            // ค้นหาเอกสารในคอลเลคชันที่มีชื่อตรงกันกับ storyId
            const storyQuery = query(collection(db, storyId));
            const storySnapshot = await getDocs(storyQuery);

            // หากพบเอกสารที่ตรงกัน
            if (!storySnapshot.empty) {
                // วนลูปผ่านเอกสารในคอลเลคชัน
                storySnapshot.forEach(async (doc) => {
                    // ตรวจสอบว่าเอกสารมี id ที่ตรงกับ refEp หรือไม่
                    if (doc.id === refEp) {
                        // console.log('Found matching document:');
                        // console.log('Document ID:', doc.id);
                        // console.log('Document data:', doc.data());
                        // ลบเอกสารที่ตรงกับ refEp
                        await deleteDoc(doc.ref);
                        
                        window.location.reload();
                        console.log('Document with ID:', doc.id, 'deleted successfully');
                    }
                });
            } else {
                console.log('No matching documents found in collection:', storyId);
            }

            setModalIsOpen(false);
            
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
       
    };

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            contentLabel="Delete Episode Confirmation"
            className="custom-modal"
            overlayClassName="custom-overlay"
        >
            <div className="modal-content-delete">
                <h2>Are you sure you want to delete this episode?</h2>
                <button className='yes' onClick={handleDelete}>Yes</button>
                <button onClick={() => setModalIsOpen(false)}>No</button>
            </div>
        </Modal>
    );
}

AlertDeleteEP.propTypes = {
    modalIsOpen: PropTypes.bool.isRequired,
    setModalIsOpen: PropTypes.func.isRequired,
    storyId: PropTypes.string.isRequired,
    refEp: PropTypes.string.isRequired,
};

export default AlertDeleteEP;
