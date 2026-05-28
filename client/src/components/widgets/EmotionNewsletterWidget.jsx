import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

// Premium Glassmorphism Container with HSL gradient border
const WidgetContainer = styled.div`
  background: var(--bg-secondary, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  margin-top: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
    border-color: #1da1f2;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #1da1f2 0%, #0d8bd9 100%);
  }
`;

const HeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(29, 161, 242, 0.1);
  color: #1da1f2;
`;

const WidgetTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #0f1419);
  margin: 0;
  font-family: inherit;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: var(--text-muted, #536471);
  line-height: 1.5;
  margin: 0 0 20px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 42px;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e1e8ed);
  background: var(--bg-tertiary, #f7f9fa);
  color: var(--text-primary, #0f1419);
  outline: none;
  transition: all 0.2s ease-in-out;

  &:focus {
    border-color: #1da1f2;
    background: var(--bg-secondary, #ffffff);
    box-shadow: 0 0 0 3px rgba(29, 161, 242, 0.15);
  }

  &::placeholder {
    color: var(--text-muted, #8899a6);
  }
`;

const InputIcon = styled(Mail)`
  position: absolute;
  left: 14px;
  color: var(--text-muted, #8899a6);
  width: 18px;
  height: 18px;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1da1f2 0%, #0d8bd9 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.25);

  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(29, 161, 242, 0.35);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px 0;
  animation: fadeIn 0.4s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const SuccessIcon = styled(CheckCircle2)`
  color: #2ebd59;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
`;

const SuccessTitle = styled.h4`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary, #0f1419);
  margin: 0 0 6px 0;
`;

const SuccessText = styled.p`
  font-size: 0.85rem;
  color: var(--text-muted, #536471);
  margin: 0;
`;

const EmotionNewsletterWidget = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <WidgetContainer>
      {submitted ? (
        <SuccessContainer>
          <SuccessIcon />
          <SuccessTitle>सफलतापूर्वक सदस्यता ली!</SuccessTitle>
          <SuccessText>हम आपको दैनिक समाचार बुलेटिन सीधे ईमेल पर भेजेंगे।</SuccessText>
        </SuccessContainer>
      ) : (
        <>
          <HeaderGroup>
            <IconWrapper>
              <Mail size={20} />
            </IconWrapper>
            <WidgetTitle>ख़ास ख़बरें सीधे आपके इनबॉक्स में</WidgetTitle>
          </HeaderGroup>
          
          <Description>
            देश-विदेश, राजनीति और चर्चित विषयों की ताज़ा अपडेट्स पाने के लिए हमारे निःशुल्क न्यूज़लेटर की सदस्यता लें।
          </Description>

          <Form onSubmit={handleSubmit}>
            <InputWrapper>
              <InputIcon />
              <StyledInput
                type="email"
                placeholder="अपना ईमेल पता दर्ज करें..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputWrapper>
            
            <SubmitButton type="submit">
              सदस्यता लें <ArrowRight size={16} />
            </SubmitButton>
          </Form>
        </>
      )}
    </WidgetContainer>
  );
};

export default EmotionNewsletterWidget;
