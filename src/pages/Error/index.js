import { Link } from 'react-router-dom'
import './index.css'
import error from '../../assets/images/404.png'

export default function ErrorPage() {
    return (
        <div className='error-container'>
            <img src={error} alt="error" width={300} height={209} />
            <div>Oops! The page you're looking for does not exist or is under construction</div>
            <Link to="/">Back to homepage</Link>
        </div>
    )
}