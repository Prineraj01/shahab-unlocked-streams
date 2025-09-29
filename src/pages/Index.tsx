import AccessControl from '../components/AccessControl';
import HomePage from '../components/HomePage';

const Index = () => {
  return (
    <AccessControl>
      <HomePage />
    </AccessControl>
  );
};

export default Index;
