import { Navbar, Nav, Container, Button, Image  } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';

const Header = () => {
    const { user, logout, extendSession, remainingTime } = useAuth();
    const navigate = useNavigate();

    // ✅ 로컬 스토리지에서 가져온 profileImg ID를 저장할 상태
    const [profileImgId, setProfileImgId] = useState(null);

    // ✅ 컴포넌트가 처음 렌더링될 때 로컬 스토리지에서 값을 가져옵니다.
    useEffect(() => {
        const storedProfileImg = localStorage.getItem('profileImg');
        if (storedProfileImg) {
            setProfileImgId(storedProfileImg);
        }
    }, []); // 빈 배열은 컴포넌트 마운트 시 한 번만 실행됨을 의미합니다.

    // 남은 시간을 MM:SS 형식으로 변환하는 함수
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
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

                                {/* ✅ 프로필 이미지 표시 영역 */}
                                {profileImgId  && (
                                    <Image
                                        src={`http://localhost:8080/member/view/${profileImgId}`}
                                        alt="Profile"
                                        roundedCircle // 이미지를 원형으로 만듭니다.
                                        style={{
                                            width: '40px',   // 크기는 여기서 조절 가능합니다.
                                            height: '40px',
                                            marginLeft: '10px',
                                            marginRight: '5px'
                                        }}
                                    />
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