import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { signUp, signIn } from '../../helpers/auth';
import './index.css';

function LoginForm(props) {
    function handleChange(e) {
        props.setUser(prevUser => ({
            ...prevUser,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <>
            <h2>Chào mừng đến với Chat Place <br /> <span>Đăng nhập để tiếp tục</span></h2>
            <label data-foo="label" htmlFor="email">Email <span>*</span></label>
            <input id="email" type="email" name="email" value={props.user.email}
                onChange={handleChange} />
            <label data-foo="label" htmlFor="password">Mật khẩu <span>*</span></label>
            <input id="password" type="password" name="password"
                value={props.user.password} onChange={handleChange} onBlur={props.checkStrength} />
            <ErrorPopUp validate={props.validate} endTransition={props.endTransition} />
            <div className='after-input'>
                <input type="checkbox" id="session" />
                <label htmlFor="session">Duy trì đăng nhập</label>
                <a id="forget" href="/forgot">Quên mật khẩu?</a>
            </div>
            <button type="submit">Đăng nhập</button>
            <p>Chưa có tài khoản? <span><Link to="/register">Đăng ký ngay</Link></span></p>
        </>
    )
}

function RegisterForm(props) {
    function handleChange(e) {
        props.setUser(prevUser => ({
            ...prevUser,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <>
            <h2>Tạo tài khoản</h2>
            <label data-foo="label" htmlFor="email">Email <span>*</span></label>
            <input id="email" type="email" name="email" value={props.user.email}
                onChange={handleChange} />
            <label data-foo="label" htmlFor="username">Tên đăng nhập <span>*</span></label>
            <input id="username" type="text" name="username" value={props.user.username}
                onChange={handleChange} />                    
            <label data-foo="label" htmlFor="password">Mật khẩu <span>*</span></label>
            <input id="password" type="password" name="password"
                value={props.user.password} onChange={handleChange} onBlur={props.checkStrength} />
            <ErrorPopUp validate={props.validate} endTransition={props.endTransition} />
            <button type="submit">Đăng ký</button>
            <p>Đã có tài khoản? <span><Link to='/login'>Đăng nhập ngay</Link></span></p>
        </>
    )
}

function ErrorPopUp(props) {
    return (
        <>
            <div className={'popup ' + (props.validate.active && "active")}
             onTransitionEnd={props.endTransition}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" enableBackground="new 0 0 448 433" viewBox="0 0 448 433" width={30} height={30}>
                    <radialGradient id="XMLID_1_" gradientUnits="userSpaceOnUse" cy="393.79" cx="216.7" r="296.7">
                        <stop stopColor="#F4D708" offset="0" />
                        <stop stopColor="#FCB400" offset="1" />
                    </radialGradient>
                    <path d="m8.551 390.5l184.85-368.8s26.409-31.504 52.815 0c26.41 31.501 180.19 370.65 180.19 370.65s3.105 18.534-27.961 18.534-361.94 0-361.94 0-23.299 0-27.959-20.38z" fill="url(#XMLID_1_)" />
                    <path stroke="#E2A713" strokeWidth="5" d="m8.551 390.5l184.85-368.8s26.409-31.504 52.815 0c26.41 31.501 180.19 370.65 180.19 370.65s3.105 18.534-27.961 18.534-361.94 0-361.94 0-23.299 0-27.959-20.38z" fill="none" />
                    <path d="m212.5 292.63c-13.168-79.969-19.75-123.12-19.75-129.45 0-7.703 2.551-13.926 7.66-18.676 5.105-4.746 10.871-7.121 17.293-7.121 6.949 0 12.82 2.535 17.609 7.598s7.188 11.023 7.188 17.883c0 6.543-6.668 49.801-20 129.77h-10zm27 38.17c0 6.098-2.156 11.301-6.469 15.613-4.313 4.309-9.461 6.465-15.453 6.465-6.098 0-11.301-2.156-15.613-6.465-4.313-4.313-6.465-9.516-6.465-15.613 0-5.992 2.152-11.141 6.465-15.453s9.516-6.469 15.613-6.469c5.992 0 11.141 2.156 15.453 6.469s6.48 9.45 6.48 15.44z" />
                </svg>
                <p>{props.validate.message}</p>
            </div>
        </>
    )
}

export default function Login(props) {
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: "",
        username: "",
        password: "",
    });
    const [message, setMessage] = useState({
        content: null,
        status: ""
    });

    const [validate, setValidate] = useState({
        active: null,
        message: ""
    });

    useEffect(() => {
        const reload = () => {
            setValidate({
                active: null,
                message: ""
            });
        }
        reload();
    }, [location.pathname])

    async function handleSubmit(e) {
        e.preventDefault();
        if(user.email != "" && user.password != "") {
            if(!validate.message) {
                try {
                    if (location.pathname === "/login") {
                        await signIn(user.email, user.password);
                        navigate("/chat");
                    }
                    else {
                        await signUp(user.email, user.username, user.password);
                        setMessage(prevMess => ({
                            ...prevMess,
                            content: "Tạo tài khoản thành công",
                            status: " success"
                        }));
                    }
                } catch (err) {
                    console.log(err)
                    setMessage(prevMess => ({
                        ...prevMess,
                        content: extractError(err.code) == null ? err.code : extractError(err.code),
                        status: " error"
                    }));
                }
            }
        }
        else {
            setValidate(prevVal => ({
                ...prevVal,
                message: "Xin điền đầy đủ thông tin",
                active: true
            }));
        }
    }

    function extractError(code) {
        switch (code) {
            case "auth/user-not-found":
                return "Account không tồn tại";
            case "auth/email-already-in-use":
                return "Email đang được sử dụng bởi account khác";
            case "auth/wrong-password":
                return "Sai mật khẩu";
        }
    }

    function checkStrength(e) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/g
        const invalid = /([ .,/\\\[\]'":;`(){}|<>?+-])/g

        let result = e.target.value.match(invalid)
        if (result) {
            var err = `Mật khẩu không được chứa ${result.length != 1 && "các"} kí tự `;
            result.forEach((item, index) => {
                if (index == 0) err += `"${item}"`
                else if (index == result.length - 1) err += ` "${item}"`
                else err += `, "${item}",`
            })
            setValidate(prevVal => ({
                ...prevVal,
                message: err,
                active: true
            }));
        }
        else {
            result = e.target.value.match(regex)
            if (!result) {
                setValidate(prevVal => ({
                    ...prevVal,
                    message: "Mật khẩu phải bao gồm ít nhất một kí tự hoa, thường, kí tự số và kí tự đặc biệt",
                    active: true
                }));
            }
        }
    }

    function endTransition() {
        setValidate(prevVal => ({
            ...prevVal,
            message: null,
            active: null
        }))
    }

    return (
        <div className='container'>
            <div className={'snackbar' + message.status} onAnimationEnd={() => {
                setMessage(prevMess => ({
                    ...prevMess,
                    status: ""
                }));
            }}>
                {message ? <p>{message.content}</p> : null}
            </div>
            <div className='login-form' onSubmit={handleSubmit}>
                <form autoComplete='off'>
                    {location.pathname === "/login" ? <LoginForm user={user} setUser={setUser}
                        validate={validate} checkStrength={checkStrength}
                        endTransition={endTransition} /> :
                        <RegisterForm user={user} setUser={setUser}
                            validate={validate} checkStrength={checkStrength}
                            endTransition={endTransition} />}
                </form>
            </div>
        </div>
    )
}