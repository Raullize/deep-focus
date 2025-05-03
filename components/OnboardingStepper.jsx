'use client'

import React, { useState, useEffect } from 'react';
import Stepper, { Step } from './ui/Stepper';
import { motion } from 'framer-motion';

const OnboardingStepper = ({ onComplete, forceShow = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Se forceShow for true, mostrar o onboarding independentemente
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    
    try {
      // Verificar no localStorage se o onboarding já foi mostrado
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      
      if (hasSeenOnboarding !== 'true') {
        // Se for a primeira visita, mostrar o onboarding
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
      // Em caso de erro de acesso ao localStorage, mostrar de qualquer forma
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleComplete = () => {
    // Marcar que o usuário já viu o onboarding
    try {
      localStorage.setItem('hasSeenOnboarding', 'true');
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
    >
      <Stepper
        onFinalStepCompleted={handleComplete}
        stepCircleContainerClassName="max-w-lg"
      >
        <Step>
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Bem-vindo ao DeepFocus!</h2>
            <img 
              src="/illustrations/pomodoro.svg" 
              alt="Pomodoro Timer" 
              className="w-32 h-32 mb-4"
              onError={(e) => { e.target.src = '/favicon.ico'; e.target.className = "w-16 h-16 mb-4"; }}
            />
            <p className="text-center mb-2">
              O DeepFocus é um temporizador baseado na técnica Pomodoro para aumentar sua produtividade e foco.
            </p>
            <p className="text-center text-sm text-gray-400">
              Continue para aprender como usar.
            </p>
          </div>
        </Step>

        <Step>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Como funciona a técnica Pomodoro</h2>
            <div className="space-y-2 mb-4">
              <div className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-1">
                  <span className="block h-2 w-2 rounded-full bg-primary"></span>
                </div>
                <p>Trabalhe com <span className="text-primary font-medium">blocos de foco</span> (padrão: 25 minutos)</p>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-1">
                  <span className="block h-2 w-2 rounded-full bg-primary"></span>
                </div>
                <p>Faça <span className="text-green-400 font-medium">pausas curtas</span> entre blocos (padrão: 5 minutos)</p>
              </div>
              <div className="flex items-start">
                <div className="bg-primary/20 rounded-full p-1 mr-2 mt-1">
                  <span className="block h-2 w-2 rounded-full bg-primary"></span>
                </div>
                <p>Após 4 blocos, faça uma <span className="text-indigo-400 font-medium">pausa longa</span> (padrão: 15 minutos)</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              Todos os tempos são personalizáveis nas configurações.
            </p>
          </div>
        </Step>

        <Step>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Dicas para melhorar seu foco</h2>
            <div className="space-y-3 mb-4 max-w-[350px]">
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">💧</span>
                <p>Mantenha uma garrafa de água por perto e hidrate-se regularmente</p>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">📵</span>
                <p>Evite redes sociais e notificações durante os blocos de foco</p>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">📝</span>
                <p>Defina claramente o que deseja realizar em cada bloco de foco</p>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-400 mr-2">🧘</span>
                <p>Use as pausas para alongar-se e relaxar a mente</p>
              </div>
            </div>
          </div>
        </Step>

        <Step>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-green-400 mb-4">Controles do DeepFocus</h2>
            <div className="space-y-3 mb-4 max-w-[350px]">
              <div className="flex items-start">
                <span className="text-primary mr-2">⏱️</span>
                <p>Use os botões <span className="font-medium">Iniciar</span>, <span className="font-medium">Pausar</span>, <span className="font-medium">Reiniciar</span> e <span className="font-medium">Pular</span> para controlar o timer</p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-2">⚙️</span>
                <p>Personalize os tempos e as notificações nas <span className="font-medium">Configurações</span></p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-2">🔍</span>
                <p>Ative o <span className="font-medium">Modo Foco</span> para uma interface minimalista</p>
              </div>
              <div className="flex items-start">
                <span className="text-primary mr-2">⌨️</span>
                <p>Use os atalhos de teclado para controle rápido</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              Você está pronto para começar! Clique em Concluir abaixo.
            </p>
          </div>
        </Step>

        <Step>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Desenvolvido por Raul Lize</h2>
            <p className="text-center mb-4">
              Obrigado por usar o DeepFocus! Se você tiver alguma dúvida ou sugestão, entre em contato.
            </p>
            <div className="flex space-x-4 mb-2">
              <a 
                href="https://github.com/Raullize" 
                target="_blank"
                rel="noopener noreferrer" 
                className="text-white hover:text-primary transition-colors"
                title="GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/raullizeteixeira/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
                title="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a 
                href="https://raul-lize-portfolio.vercel.app" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-colors"
                title="Portfólio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/>
                </svg>
              </a>
            </div>
          </div>
        </Step>
      </Stepper>
    </motion.div>
  );
};

export default OnboardingStepper; 