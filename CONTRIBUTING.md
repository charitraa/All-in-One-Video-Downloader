# Contributing to VideoMaster

Thank you for your interest in contributing to VideoMaster! We welcome contributions from the community. Please take a moment to review this document to understand how you can contribute effectively.

## 🛠️ Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/videomaster.git
cd videomaster

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
cd downloads

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 How to Contribute

### 1. Choose an Issue
- Check the [Issues](https://github.com/your-username/videomaster/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Your Changes
- Write clear, concise commit messages
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes
```bash
# Backend tests
python manage.py test

# Frontend linting
npm run lint

# Build frontend
npm run build
```

### 5. Submit a Pull Request
- Push your branch to your fork
- Create a Pull Request with a clear description
- Reference any related issues
- Wait for review and address feedback

## 📝 Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints where possible
- Write docstrings for functions and classes
- Use meaningful variable and function names

### TypeScript/React (Frontend)
- Use TypeScript for all new code
- Follow the existing component structure
- Use functional components with hooks
- Maintain consistent styling with Tailwind CSS

### General
- Write clear, concise comments
- Keep functions small and focused
- Use descriptive variable names
- Follow the existing project structure

## 🧪 Testing

### Backend Testing
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test youtube

# Run with coverage
coverage run manage.py test
coverage report
```

### Frontend Testing
```bash
# Run linting
npm run lint

# Build to check for errors
npm run build
```

## 📚 Documentation

- Update README.md for any new features
- Add docstrings to new functions
- Update API documentation for endpoint changes
- Keep comments up to date

## 🎯 Types of Contributions

### Code Contributions
- Bug fixes
- New features
- Performance improvements
- Code refactoring

### Non-Code Contributions
- Documentation improvements
- Translation updates
- UI/UX improvements
- Issue reporting and triaging

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: add support for TikTok downloads
fix: resolve YouTube playlist download issue
docs: update API documentation
style: format code according to PEP 8
refactor: simplify download logic
test: add unit tests for video validation
```

## 🤝 Code Review Process

1. All PRs require review before merging
2. Address review comments promptly
3. Keep PRs focused on a single feature/fix
4. Ensure CI checks pass
5. Maintain or improve code coverage

## 🐛 Reporting Issues

When reporting bugs:
- Use a clear, descriptive title
- Include steps to reproduce
- Mention your environment (OS, Python/Node versions)
- Attach screenshots or error logs if applicable
- Check if the issue already exists

## 📞 Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions or community channels
- Contact maintainers directly for urgent issues

## 🎉 Recognition

Contributors will be:
- Listed in the project's contributor list
- Mentioned in release notes
- Recognized in the community

Thank you for contributing to VideoMaster! 🎊