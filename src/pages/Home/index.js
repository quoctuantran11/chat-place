import { auth } from '../../services/firebase';
import './index.css';
import logo from '../../assets/images/logo.png';
import title from '../../assets/images/banner.png';

export default function Home(props) {
    let user = auth.currentUser;
    return (
        <div className="home-container">
            <header>
                <ul>
                    <li>
                        <a href='/'>
                            <img src={logo} alt="logo" width={40} height={40} />
                        </a>
                    </li>
                    <li>
                        {props.username ? <a href="/profile">{props.username}</a> :
                            <a href="/register">Đăng ký</a>}
                    </li>
                </ul>
            </header>
            <div className='home-body'>
                <div className='right-pos'>
                    <img src={title} />
                    <h1>Kết nối mọi lúc, mọi nơi</h1>
                    <h4>Một nơi giúp bạn dễ dàng trò chuyện hàng ngày và gặp mặt thường xuyên</h4>
                    <a href="/chat">Tám chuyện</a>
                </div>
            </div>
            <footer>
                <ul>
                    <li>&copy; Twan 2022</li>
                    <li><a href=''>Điều khoản</a></li>
                    <li><a href=''>Quyền riêng tư</a></li>
                    <li><a href=''>Cookie</a></li>
                    <li><a href=''>Bảo mật</a></li>
                    <li><a href=''>Về tôi</a></li>
                </ul>
            </footer>
        </div>
    )
}