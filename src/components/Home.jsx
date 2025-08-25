//추가, 로그인 정보 표기
import { useAuth } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';
import TodoList from './TodoList';
import Header from './Header';

const Home = () => {
    //추가, 로그인 정보 표기
    const { user } = useAuth(); // Context에서 user 정보 가져오기

    return (
        <>
            {/* 공통헤더 */}
            <Header />
            {/* ✅ 홈 화면 */}
            <Container className="mt-5 text-center">
                <h2>홈</h2>
                {user ? (
                    <>
                        <div>
                            <TodoList />
                        </div>
                    </>
                ) : (
                    <p>로그인이 필요합니다.</p>
                )}
            </Container>
        </>
    );
};

export default Home;