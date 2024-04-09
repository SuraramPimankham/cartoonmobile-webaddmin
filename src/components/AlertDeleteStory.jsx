import React from 'react';
import PropTypes from 'prop-types'; // นำเข้า  
import Modal from 'react-modal';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'; // นำเข้าเพิ่ม
import { db } from '../firebase'; // นำเข้า Firebase firestore
import './css/AlertDeleteStory.css'; // นำเข้าไฟล์ CSS

Modal.setAppElement('#root');

function AlertDeleteStory({ modalIsOpen, setModalIsOpen, id }) {

  const handleDelete = async () => {
    try {
      console.log('ลบ' + id);
      // 1. ลบข้อมูลที่เกี่ยวข้องกับ id ใน collection ที่เท่ากับ id ที่กำหนดไว้
      const epCollectionRef = collection(db, id);
      const epQuery = query(epCollectionRef);
      const epSnapshot = await getDocs(epQuery);
      epSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // 2. ลบเอกสารที่มี id เท่ากับ id ที่กำหนดไว้ใน collection "storys".
      await deleteDoc(doc(db, 'storys', id));
      
      // เปลี่ยนเส้นทางกลับไปที่ /story
      window.location.href = '/story';

      console.log('Story deleted successfully.');
      setModalIsOpen(false);
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      contentLabel="Delete Story Confirmation"
      className="custom-modal"
      overlayClassName="custom-overlay"
    >
      <div className="modal-content-alert-delete">
        <h2>Are you sure you want to delete this story?</h2>
        <button className='yes' onClick={handleDelete}>Yes</button>
        <button onClick={() => setModalIsOpen(false)}>No</button>
      </div>
    </Modal>
  );
}

AlertDeleteStory.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  setModalIsOpen: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

export default AlertDeleteStory;
