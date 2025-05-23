export default function Footer() {
  return (
    <footer className="bg-light py-4 mt-auto">
      <div className="container text-center">
        <p className="mb-0 text-muted">
          &copy; {new Date().getFullYear()} Mind Haven. All rights reserved.
        </p>
        <div className="mt-2">
          <a href="#" className="link-secondary me-3">Privacy Policy</a>
          <a href="#" className="link-secondary me-3">Terms of Service</a>
          <a href="#" className="link-secondary">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}