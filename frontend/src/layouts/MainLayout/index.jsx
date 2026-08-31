import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default MainLayout
