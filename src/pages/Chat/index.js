import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { logOut } from '../../helpers/auth';
import { db } from '../../services/firebase';
import { ref, onValue, push, equalTo, query, orderByChild } from 'firebase/database';
import './index.css';

var profileStatus = [
    {
        color: 'status-active',
        value: 'Đang hoạt động'
    },
    {
        color: 'status-inactive',
        value: 'Đang treo máy'
    },
    {
        color: 'status-busy',
        value: 'Đang bận'
    },
    {
        color: 'status-out',
        value: 'Không hoạt động'
    }
];

const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [ref]);
};

const FriendsList = ({ loggedUser, setSelected }) => {
    const [friends, setFriends] = useState(null);
    const [isCopy, setIsCopy] = useState("Sao chép link");
    const textToCopy = useRef();
    const isIE = false || !!document.documentMode;

    useEffect(() => {
        function getFriendData() {
            try {
                onValue(ref(db, `users/${loggedUser.displayName}`), snapshot => {
                    let data = snapshot.val();
                    setFriends(data.friends);
                })
            }
            catch (e) {
                console.error(e);
            }
        }

        getFriendData();
    }, [])

    function copyClipboard() {
        if (isIE) {
            window.clipboardData.setData("Text", textToCopy.current.innerText)
        }
        else {
            navigator.clipboard.writeText(textToCopy.current.innerText)
        }
        setIsCopy("Đã sao chép");
    }

    return (
        <ul>
            {friends ?
                friends.map((friend, index) => {
                    return (
                        <li key={friend.uid}>
                            <input type="radio" id={"active-" + index} name="account"
                                value={friend.uid} onChange={() => setSelected(friend)} />
                            <label htmlFor={"active-" + index}>
                                <div className='profile in-list'>
                                    <div className='profile-picture'></div>
                                    <p>{friend.username}</p>
                                </div>
                            </label>
                        </li>
                    )
                })
                :
                <li>
                    <div className='no-result'>
                        <p>Mời bạn bè vào trò chuyện</p>
                        <p ref={textToCopy}>This is the link</p>
                        <button type="button" onClick={copyClipboard}>
                            {isCopy}
                        </button>
                    </div>
                </li>}
        </ul>
    )
}

const ConversationDisplay = ({ selected, loggedUser }) => {
    const chatRef = useRef();
    const chatID = [loggedUser.uid, selected.uid].sort().join("")

    const [typing, setTyping] = useState("");
    const [connection, setConnection] = useState(null);
    const [lastOnline, setLastOnline] = useState(null);
    const [error, setError] = useState({
        read: null,
        write: null
    })
    const [chat, setChat] = useState({
        loading: false,
        messages: null
    });

    useEffect(() => {
        try {
            onValue(query(ref(db, 'users'), orderByChild('username'), equalTo(selected.username)), snapshot => {
                setConnection(snapshot.val()[selected.username].connections ?? null)
                setLastOnline(snapshot.val()[selected.username].lastOnline)
            })
        }
        catch (e) {
            console.log(e)
        }
    }, [selected])

    useEffect(() => {
        function getChatHistory() {
            setError(prevErr => ({
                ...prevErr,
                read: null
            }));
            setChat(prevChat => ({
                ...prevChat,
                loading: true
            }));

            try {
                onValue(ref(db, "chats/" + chatID), snapshot => {
                    setChat(prevChat => ({
                        ...prevChat,
                        messages: snapshot.val(),
                        loading: false
                    }));
                })
                chatRef.current.scrollBy(0, chatRef.current.scrollHeight);
            }
            catch (e) {
                setError(prevErr => ({
                    ...prevErr,
                    read: e.message
                }));
            }
        }

        getChatHistory();
    }, [chatID])

    async function submitMessage(e) {
        e.preventDefault();
        setError(prevErr => ({
            ...prevErr,
            write: null
        }));

        if (typing != "") {
            try {
                await push(ref(db, "chats/" + chatID), {
                    content: typing,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    uid: loggedUser.uid
                })
                setTyping("");
                chatRef.current.scrollBy(0, chatRef.current.scrollHeight);
            } catch (error) {
                setError(prevErr => ({
                    ...prevErr,
                    write: error.message
                }));
            }
        }
    }

    function distiguished(uid) {
        return uid == loggedUser.uid;
    }

    function isSameTime(cur, prev) {
        return cur == prev;
    }

    function calOffTime() {
        let result = "Hoạt động";
        let sec = Math.floor((Date.now() - lastOnline) / 1000);
        if (sec > 59) {
            let min = Math.floor(sec / 60);
            if (min > 59) {
                let hour = Math.floor(min / 60);
                if (hour > 23) {
                    let day = Math.floor(hour / 24);
                    if(day > 1) return `${result} nhiều ngày trước`
                    return `${result} ${day} ngày trước`;
                }
                else {
                    if (hour > 0) {
                        return `${result} ${hour} giờ trước`;
                    }
                }
            }
            else {
                if (min > 0) {
                    return `${result} ${min} phút trước`;
                }
            }
        }
    }

    return (
        <>
            <div className='profile in-box'>
                <div className='profile-picture'></div>
                <div className='info'>
                    <p>{selected.username}</p>
                    <div className='status'>
                        {connection ?
                            <>
                                <div className={'status-color status-active'}></div>
                                <h5>Đang hoạt động</h5>
                            </>
                            :
                            lastOnline && <h5>{calOffTime()}</h5>}
                    </div>
                </div>
                <div className='help-btns'>
                    <button type="button">
                        <svg width={15} height={15} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z" />
                        </svg>
                    </button>
                    <button type="button">
                        <svg width={15} height={15} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className='chat-place'>
                <div className='chat-box' ref={chatRef}>
                    {!chat.loading ? chat.messages ?
                        Object.keys(chat.messages).map((item, index) => {
                            return <div key={item}
                                className={'message-box' + (distiguished(chat.messages[item].uid) ? ' me' : ' other') +
                                    (index > 0 && isSameTime(chat.messages[Object.keys(chat.messages)[index]].timestamp,
                                        chat.messages[Object.keys(chat.messages)[index - 1]].timestamp) ? ' no-time' : '')}>
                                {index > 0 && isSameTime(chat.messages[Object.keys(chat.messages)[index]].timestamp,
                                    chat.messages[Object.keys(chat.messages)[index - 1]].timestamp) ? null :
                                    <h6>{chat.messages[item].timestamp}</h6>}
                                <p>{chat.messages[item].content}</p>
                            </div>
                        }) : <div className='no-history'>
                            <div className='divider-chat'></div>
                            <h5>Bắt đầu cuộc trò chuyện</h5>
                            <div className='divider-chat'></div>
                        </div>
                        : <div className='loading'></div>}
                </div>
                <div className='bottom-box'>
                    <form onSubmit={submitMessage}>
                        <div className='typing-box'>
                            <input type="text" placeholder="Viết gì đó đi"
                                onChange={(e) => setTyping(e.target.value)}
                                value={typing} />
                            <button type="button">
                                <svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M256 352C293.2 352 319.2 334.5 334.4 318.1C343.3 308.4 358.5 307.7 368.3 316.7C378 325.7 378.6 340.9 369.6 350.6C347.7 374.5 309.7 400 256 400C202.3 400 164.3 374.5 142.4 350.6C133.4 340.9 133.1 325.7 143.7 316.7C153.5 307.7 168.7 308.4 177.6 318.1C192.8 334.5 218.8 352 256 352zM208.4 208C208.4 225.7 194 240 176.4 240C158.7 240 144.4 225.7 144.4 208C144.4 190.3 158.7 176 176.4 176C194 176 208.4 190.3 208.4 208zM304.4 208C304.4 190.3 318.7 176 336.4 176C354 176 368.4 190.3 368.4 208C368.4 225.7 354 240 336.4 240C318.7 240 304.4 225.7 304.4 208zM512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256zM256 48C141.1 48 48 141.1 48 256C48 370.9 141.1 464 256 464C370.9 464 464 370.9 464 256C464 141.1 370.9 48 256 48z" />
                                </svg>
                            </button>
                        </div>
                        <button type="submit">
                            {typing != "" ?
                                <svg width={20} height={20} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                    <path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
                                </svg> :
                                <div onClick={() => setTyping("&#x1F44D;")}>&#x1F44D;</div>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default function Chat() {
    const { loggedUser } = useAuth();

    const [keyword, setKeyword] = useState(null);
    const [selected, setSelected] = useState(null);
    const [toggle, setToggle] = useState(false);
    const [appear, setAppear] = useState(false);
    const [status, setStatus] = useState(0);

    const btnRef = useRef();
    const statusRef = useRef();

    const handleClickOutside = () => {
        setToggle(false);
    }

    useOutsideClick(btnRef, handleClickOutside);

    return (
        <div className='chat-container'>
            <div className='friends-list'>
                <div className='profile'>
                    <div className='profile-picture'></div>
                    <div className='info'>
                        <p>{loggedUser.displayName}</p>
                        <div className='status'>
                            <div onClick={() => setAppear(appear => !appear)} 
                            className={'status-color ' + profileStatus[status].color}></div>
                            <h5>{profileStatus[status].value}</h5>
                        </div>
                    </div>
                    <div ref={statusRef} className={'status-box ' + (appear && "appear")}>
                        {profileStatus.map((stat, index) => 
                            <button key={stat.color} type="button" onClick={() => {
                                setStatus(index)
                                setAppear(false)
                            }}>
                                {stat.value}
                            </button>
                        )}
                    </div>
                    <button type='button' onClick={(e) => {
                        e.stopPropagation();
                        setToggle(true);
                    }}>
                        <svg width={15} height={15} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z" />
                        </svg>
                    </button>
                    <div ref={btnRef} className={'profile-features ' + (toggle ? "toggle" : "")}>
                        <button type="button" onClick={async () => await logOut()}>
                            Đăng xuất
                        </button>
                    </div>
                </div>
                <h3>Bạn bè đang hoạt động</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className='search-form'>
                        <svg width={15} height={15} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z" />
                        </svg>
                        <input type="text" placeholder='Tìm bạn để trò chuyện'
                            onChange={(e) => setKeyword(e.target.value)} />
                    </div>
                </form>
                <FriendsList loggedUser={loggedUser} setSelected={setSelected} />
            </div>
            <div className='divider'></div>
            <div className='conversation-box'>
                {selected ? <ConversationDisplay selected={selected} loggedUser={loggedUser}
                    status={status} /> :
                    <div className='no-selection'>
                        Chọn bạn mà trò chuyện
                    </div>}
            </div>
        </div>
    )
}