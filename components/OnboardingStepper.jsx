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
      </Stepper>
    </motion.div>
  );
};

export default OnboardingStepper; 