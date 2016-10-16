# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.synced_folder ".", "/home/vagrant/workspace"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = 4096
    vb.cpus = 2
  end
  config.vm.provision "shell", inline: <<-SHELL
    curl -fsSL https://get.docker.com/ | sh
    usermod -aG docker vagrant
  SHELL
end
