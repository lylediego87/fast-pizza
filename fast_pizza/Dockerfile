FROM ubuntu:latest

# command line tools for flutter
RUN apt update && apt install -y curl file git unzip xz-utils zip python3
RUN apt-get install psmisc

WORKDIR /home

RUN git clone https://github.com/flutter/flutter.git
ENV PATH "$PATH:/home/flutter/bin"
RUN echo flutter sdk-path

RUN flutter channel master
RUN flutter upgrade
RUN flutter config --enable-web

RUN flutter doctor

COPY . /code
RUN rm -rf /code/.devcontainer
RUN rm -rf /code/node_modules
RUN rm -rf /code/*.json

WORKDIR /code

RUN flutter pub get

RUN flutter build web --release 
EXPOSE 4040

RUN curl https://cors-anywhere.herokuapp.com/

RUN ["chmod", "+x", "/code/server/server.sh" ]
ENTRYPOINT [ "/code/server/server.sh" ]