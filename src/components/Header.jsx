import { Navbar, Nav, Container, Button, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios를 import 합니다.

const Header = () => {
    const { user, logout, extendSession, remainingTime } = useAuth();
    const navigate = useNavigate();

    const [profileImgId, setProfileImgId] = useState(null);
    const [mediaType, setMediaType] = useState(''); // ✅ 'image' 또는 'video'를 저장할 상태

    useEffect(() => {
        const storedProfileImg = localStorage.getItem('profileImg');
        if (storedProfileImg) {
            setProfileImgId(storedProfileImg);

            // ✅ 미디어 타입을 확인하는 함수
            const fetchMediaType = async () => {
                try {
                    // HEAD 요청으로 Content-Type만 가져옵니다.
                    const response = await axios.head(`http://localhost:8080/member/view/${storedProfileImg}`);
                    const contentType = response.headers['content-type'];

                    if (contentType.startsWith('image/')) {
                        setMediaType('image');
                    } else if (contentType.startsWith('video/')) {
                        setMediaType('video');
                    }
                } catch (error) {
                    console.error("Error fetching media type:", error);
                }
            };

            fetchMediaType();
        }
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const mediaStyle = {
        width: '40px',
        height: '40px',
        marginLeft: '10px',
        marginRight: '5px',
        borderRadius: '50%',
        objectFit: 'cover', // ✅ object-fit을 사용하여 비율을 유지하면서 채웁니다.
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    MyApp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            <div className="d-flex align-items-center">
                                <Nav.Link as={Link} to="/">
                                    홈
                                </Nav.Link>
                                <Nav.Link as={Link} to="/ai">
                                    Ai Test
                                </Nav.Link>

                                {/* ✅ 프로필 미디어 표시 영역 */}
                                {profileImgId && (
                                    <>
                                        {mediaType === 'image' && (
                                            <Image
                                                src={`http://localhost:8080/member/view/${profileImgId}`}
                                                alt="Profile"
                                                style={mediaStyle}
                                            />
                                        )}
                                        {/*Header.jsx 컴포넌트를 업데이트했음을 알려드립니다. 이제 컴포넌트는 프로필 미디어 유형(이미지 또는 동영상)을 확인하고 그에 따라 렌더링합니다. 이를 통해 프로필 사진과 프로필 동영상을 모두 표시할 수*/}
                                        {/*있습니다. 또한 미디어 유형 확인을 처리하기 위해 axios를 추가했습니다.*/}
                                        {mediaType === 'video' && (
                                            <video
                                                src={`http://localhost:8080/member/view/${profileImgId}`}
                                                autoPlay
                                                muted
                                                loop
                                                style={mediaStyle}
                                            />
                                        )}
                                    </>
                                )}

                                <Nav.Link>환영합니다, {user.mid}님!</Nav.Link>
                                <Nav.Link>
                                    {remainingTime !== null
                                        ? `로그아웃까지: ${formatTime(remainingTime)}`
                                        : ''}
                                </Nav.Link>
                                <Button
                                    variant="warning"
                                    className="ms-2"
                                    onClick={extendSession}
                                >
                                    세션 연장 (10분)
                                </Button>
                                <Button
                                    variant="danger"
                                    className="ms-2"
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                >
                                    로그아웃
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/register">
                                    회원가입
                                </Nav.Link>
                                <Nav.Link as={Link} to="/login">
                                    로그인
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
