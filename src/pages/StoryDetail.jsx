import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Modal from 'react-modal';
import { db, storage } from '../firebase';
import { format, parseISO } from 'date-fns';

import AlertDeleteStory from '../components/AlertDeleteStory';
import AddEPModal from '../components/AddEPModal';
import AlertDeleteEP from '../components/AlertDeleteEP';

import './css/StoryDetail.css';


Modal.setAppElement('#root');


function StoryDetail() {

  // ตัวแปล
  const { id } = useParams(); //นำค่า id ออกมาจาก object  โดยตรงได้โดยไม่ต้องเข้าถึง object ทั้งหมดที่ return ออกมาจาก useParams()
  const inputRef = useRef(null);

  const [storyData, setStoryData] = useState({});
  const [gridData, setGridData] = useState([]); //ตารางข้อมูล 
  const [selectedFile, setSelectedFile] = useState(null); //ไฟล์ที่เลือก
  const [fileId, setFileId] = useState(''); // Id
  const [title, setTitle] = useState(''); // ชื่อเรื่อง
  const [author, setAuthor] = useState(''); // ผู้แต่ง
  const [day, setDay] = useState(''); // วัน 
  const [description, setDescription] = useState(''); // คำอธิบาย
  const [categories, setCategories] = useState([]); // หมวดหมู่
  const [RefEp, setRefEp] = useState({});
  const [Epdata, setEpdata] = useState({});
 



  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false); // เพิ่มสถานะสำหรับการเปิด/ปิด Modal การลบ
  const [deleteEPModalIsOpen, setDeleteEPModalIsOpen] = useState(false);
  const [deleteEpData, setDeleteEpData] = useState({ storyId: null, refEp: null });



  // ฟังก์ชัน
  // useEffect ดึงข้อมูลเรื่องและข้อมูลตอนจาก Firestore
  useEffect(() => {
    // ดึงข้อมูลเรื่องและข้อมูลตอนจาก Firebase Firestore ภายใต้รูปแบบของ async function 
    const fetchStoryData = async () => {
      try {
        const docRef = doc(db, 'storys', id); //อ้างอิง: db ตัวแปรที่เก็บ reference ของ Firestore database, 'storys' คอลเลกชัน , id: เป็นรหัสหรือไอดีของเอกสาร
        const docSnap = await getDoc(docRef); //  เรียกดูข้อมูลของเอกสารใน docRef

        //ตรวจสอบว่าเอกสารที่ดึงมาจาก docRef
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStoryData(data);
          setCategories(data.categories || []);
          setFileId(data.id || '');
          setTitle(data.title || '');
          setAuthor(data.author || '');
          setDay(data.day || '');
          setDescription(data.description || '');

        } else {
          console.log('No such document!');
        }

        // db คือตัวแปรที่เก็บ reference หรืออ้างอิงไปยัง Firebase Firestore database 
        const epCollectionRef = collection(db, id);  //สร้าง reference หรืออ้างอิงไปยังคอลเลกชันที่มีชื่อเหมือนกับค่าของตัวแปร id 
        const epCollectionSnapshot = await getDocs(epCollectionRef); //ดึงข้อมูลจากคอลเลกชันที่ถูกอ้างอิงโดย epCollectionRef
        const epCollectionData = epCollectionSnapshot.docs.map(doc => doc.data()); //แปลงข้อมูลที่ถูกดึงมาจากคอลเลกชันในรูปแบบของ QuerySnapshot เป็นรูปแบบของอาร์เรย์

        
        setGridData(epCollectionData); // อัปเดตค่าของตัวแปร gridData กำหนดให้มีค่าเท่ากับ epCollectionData ซึ่งเป็นอาร์เรย์ของข้อมูลที่ถูกดึงมาจากคอลเลกชันใน Firebase Firestore ที่มีชื่อเหมือนกับ id
        // ตรวจสอบว่าคอลเลกชันที่ถูกดึงมาจาก Firebase มีเอกสารอยู่หรือไม่ 
        if (epCollectionSnapshot.exists()) {  
          const dataArray = epCollectionSnapshot.docs.map(doc => doc.data()); //ดึงข้อมูลทั้งหมดที่อยู่ในเอกสารแต่ละรายการในคอลเลกชันที่ถูกอ้างอิงโดย epCollectionSnapshot
          setEpdata(dataArray);
          setRefEp(dataArray.ep);
        }
      } catch (error) {
        console.error('Error fetching story data:', error);
      }
    };

    fetchStoryData();
  }, [id]);

  // จัดการกับการเลือกไฟล์ที่เกิดขึ้นเมื่อผู้ใช้เลือกไฟล์ใหม่จากองค์ประกอบ < input type = "file" >
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // เพิ่มหรือลบหมวดหมู่จากตัวแปร categories ของหมวดหมู่ที่เกี่ยวข้องกับเรื่องราวที่กำลังแก้ไขหรือสร้างใหม่
  const handleCategoryChange = (selectedCategory) => {
    if (categories.includes(selectedCategory)) {
      setCategories(categories.filter(category => category !== selectedCategory));
    } else {
      setCategories([...categories, selectedCategory]);
    }
  };

  // บันทึกการเปลี่ยนแปลง
  const handleSave = async () => {
    let updatedImageUrl = storyData.imageUrl; // เริ่มต้นให้เป็น imageUrl เดิม

    try {
      // ถ้ามีการเปลี่ยนชื่อ title
      if (title !== storyData.title) {
        // ลบรูปเดิมที่เกี่ยวข้องกับชื่อเดิมออกจาก Firebase storage
        const existingImageRef = ref(storage, `img_storys/${storyData.title}`);
        await deleteObject(existingImageRef);

        if (selectedFile) {
          // อัปโหลดรูปใหม่ไปยัง Firebase storage
          const newImageRef = ref(storage, `img_storys/${title}`);
          const snapshot = await uploadBytes(newImageRef, selectedFile);
          updatedImageUrl = await getDownloadURL(snapshot.ref);
        }
      } else if (selectedFile) {
        // กรณีไม่มีการเปลี่ยนชื่อเรื่อง แต่มีการเลือกรูปใหม่
        const newImageRef = ref(storage, `img_storys/${title}`);
        const snapshot = await uploadBytes(newImageRef, selectedFile);
        updatedImageUrl = await getDownloadURL(snapshot.ref);
      }

      const updatedData = {
        id: fileId,
        title: title,
        author: author,
        day: day,
        description: description,
        categories: categories,
        imageUrl: updatedImageUrl,
        createdAt: storyData.createdAt, // ใช้ค่าเดิม
        updatedAt: new Date(), // ใช้ค่าปัจจุบัน
      };

      // อัปเดตข้อมูลเอกสารด้วยข้อมูลใหม่
      await setDoc(doc(db, 'storys', id), updatedData);
      console.log('Story updated successfully.');
      // รีเฟรชหน้าเว็บหลังจากการบันทึกข้อมูลเสร็จสิ้น
      window.location.reload();
      // ให้เปลี่ยนเส้นทางหรืออัปเดต UI ตามที่เหมาะสม
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  // เรียกใช้งานโมดัลที่ใช้ในการเพิ่มข้อมูลเพิ่มเติมสำหรับเรื่องราวที่กำลังแก้ไขหรือสร้างใหม่
  const handleAddClick = (id) => {
    setAddModalIsOpen(true);
    setFileId(id);
  };

  // เรียกใช้งานโมดัลที่ใช้ในการยืนยันการลบเรื่องราว
  const handleDeleteClick = () => {
    setDeleteModalIsOpen(true);
    setFileId(id);
    console.log('ต้องการลบ : ' + id);
  };

  //เรียกใช้งานโมดัลที่ใช้ในการยืนยันการลบตอน (EP) 
  const handleDeleteEP = (storyId, refEp) => {
    setDeleteEpData({ storyId, refEp });
    setDeleteEPModalIsOpen(true);
    console.log('id : ' + storyId);
    console.log('Ep : ' + refEp);
  }



  // ui
  return (
    <div className="container center">
      {storyData && Object.keys(storyData).length > 0 ? (
        <div className="row">
          {/* frame_image */}
          <div className="double-column data1">
            <div className="file-input-container" onClick={() => inputRef.current.click()}>
              {selectedFile || storyData.imageUrl ? (
                <img src={selectedFile ? URL.createObjectURL(selectedFile) : storyData.imageUrl} alt="Image Missing" />
              ) : (
                <p>Click to select Image</p>
              )}
            </div>
            <input
              type="file"
              ref={inputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          {/* detail EP */}
          <div className="double-column">
            <div className="input-row">
              <label htmlFor="fileId" className="label">ID</label>
              <input
                type="text"
                value={fileId || id} // ใช้ fileId ถ้ามีค่า ถ้าไม่ใช้ storyData.id จาก Firebase
                readOnly
                onChange={(e) => setFileId(e.target.value)}
              />
              <label htmlFor="createdAt" className="label">Create At</label>
              <input
                type="text"
                value={format(parseISO(storyData.createdAt.toDate().toISOString()), 'dd/MM/yyyy : HH.mm')}
                readOnly
              />
              <label htmlFor="updatedAt" className="label">Update At</label>
              <input
                type="text"
                value={format(parseISO(storyData.updatedAt.toDate().toISOString()), 'dd/MM/yyyy : HH.mm')}
                readOnly
              />
            </div>
            <div className="input-row">
              <label htmlFor="title" className="label">Title</label>
              <input
                type="text"
                value={title || title} // ใช้ title ถ้ามีค่า ถ้าไม่ใช้ storyData.title จาก Firebase
                onChange={(e) => setTitle(e.target.value)}
              />
              <label htmlFor="author" className="label">Author</label>
              <input
                type="text"
                value={author || storyData.author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="input-row">
              <label htmlFor="dropdown" className="label">Day</label>
              <select
                id="dropdown"
                name="dropdown"
                className="custom-dropdown"
                value={day || storyData.day}
                onChange={(e) => setDay(e.target.value)}
              >
                <option value=""></option>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>
              <label className="label">Category</label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={categories.includes("action")}
                  onChange={() => handleCategoryChange("action")}
                />{" "}
                Action
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={categories.includes("comedy")}
                  onChange={() => handleCategoryChange("comedy")}
                />{" "}
                Comedy
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={categories.includes("romance")}
                  onChange={() => handleCategoryChange("romance")}
                />{" "}
                Romance
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={categories.includes("fantasy")}
                  onChange={() => handleCategoryChange("fantasy")}
                />{" "}
                Fantasy
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={categories.includes("horror")}
                  onChange={() => handleCategoryChange("horror")}
                />{" "}
                Horror
              </label>
              {/* เพิ่ม category อื่น ๆ ตามที่คุณต้องการ */}
            </div>

            <div className="input-row">
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="input-row">
              <button className="save-button" onClick={handleSave}>Save</button>
              <button className="delete-button" onClick={handleDeleteClick}>Delete</button>
            </div>
          </div>
          <AlertDeleteStory
            modalIsOpen={deleteModalIsOpen}
            setModalIsOpen={setDeleteModalIsOpen}
            id={id}
          />
        </div>
      ) : (
        <h2>...Loading story data...</h2>
      )}
      <div className="divider"></div>

      <div className="row grid-container">
        <div className="grid-container">
          <div className="grid-item-add" onClick={() => handleAddClick(id)}>
            <h2>+</h2>
          </div>
          {gridData.map((item, index) => (
            <div className="grid-item-ep" key={index}>
              <img src={storyData.imageUrl} alt={title + " EP " + item.ep} />
              <p>{title + " EP " + item.ep}</p>
              <div className="corner-box"></div>
              <button className="delete-button" onClick={() => handleDeleteEP(storyData.id, title + " EP " + item.ep)}>Delete</button>
            </div>
          ))}
          <AlertDeleteEP
            modalIsOpen={deleteEPModalIsOpen}
            setModalIsOpen={setDeleteEPModalIsOpen}
            storyId={deleteEpData.storyId}
            refEp={deleteEpData.refEp}
          />
          
            

        </div>
      </div>
      <AddEPModal
        isOpen={addModalIsOpen}
        onRequestClose={() => setAddModalIsOpen(false)}
        id={id}
        title={title}
      />
    </div>
  );

}
export default StoryDetail;
