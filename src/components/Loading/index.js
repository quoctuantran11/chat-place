import './index.css';

export default function Loading() {
    return(
        <div className='loading-container'>
            <div className="loading"></div>
            <p>Loading <span>. </span><span>. </span><span>. </span></p>
        </div>
    )
}