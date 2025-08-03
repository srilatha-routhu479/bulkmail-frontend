import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';

function App() {
  const [msg, setMsg] = useState('');
  const [emaillist, setEmaillist] = useState([]);
  const [isSending, setIsSending] = useState(false);

  function handlemsg(event) {
    setMsg(event.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const emails = jsonData.flat().filter((cell) =>
        typeof cell === 'string' && cell.includes('@')
      );

      const validEmails = emails.filter(email =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );

      setEmaillist(validEmails);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    if (!msg.trim() || emaillist.length === 0) {
      alert('Please enter a message and upload a valid Excel file.');
      return;
    }

    setIsSending(true);

    axios
      .post('https://bulkmail-backend-1thv.onrender.com/sendemail', {
        msg: msg,
        emaillist: emaillist,
      })
      .then((response) => {
        console.log('Response from server:', response.data);
        alert('Email sent successfully');
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        alert('Failed to send email');
      })
      .finally(() => {
        setIsSending(false);
      });
  }

  return (
    <div className="min-h-screen bg-blue-50 text-black flex flex-col items-center p-4 gap-3 sm:gap-4">
      <h1 className="text-3xl font-bold text-white bg-blue-900 w-full text-center py-3 rounded-xl shadow">
        Bulk Email Sender
      </h1>

      <p className="text-lg bg-blue-300 text-black w-full text-center py-2 rounded shadow">
        We can send your bulk emails at once
      </p>

      <p className="text-sm text-gray-800 bg-gray-200 px-3 py-2 rounded shadow max-w-xl text-center">
        Drag and drop your Excel file below or use the file input
      </p>

      <input
        type="file"
        onChange={handlefile}
        className="w-full max-w-md border border-dotted border-blue-500 bg-white text-black rounded p-3 cursor-pointer shadow"
      />

      <textarea
        onChange={handlemsg}
        value={msg}
        placeholder="Enter message to send to all emails..."
        className="w-full max-w-3xl h-36 p-3 border border-gray-300 bg-white text-black rounded resize-none shadow"
      />

      <p className="text-sm text-gray-900 bg-blue-200 px-3 py-1 rounded shadow">
        Total Emails: {emaillist.length}
      </p>

      <button
        onClick={send}
        disabled={isSending}
        className={`${
          isSending ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        } px-5 py-2 rounded text-white shadow transition-all duration-200`}
      >
        {isSending ? 'Sending...' : 'Send Emails'}
      </button>
    </div>
  );
}

export default App;

